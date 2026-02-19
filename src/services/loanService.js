const { PrismaClient } = require('@prisma/client');
const creditScoringService = require('./creditScoringService');
const amortizationService = require('./amortizationService');

const prisma = new PrismaClient();
const config = require('../config');

async function requestLoan(userId, { amount, termMonths }) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { creditProfile: true },
  });
  if (!user) throw new Error('Usuario no encontrado');

  const profile = user.creditProfile || await prisma.creditProfile.create({
    data: { userId: user.id, creditScore: 50 },
  });

  const totalDebt = await getTotalActiveDebt(userId);
  const score = creditScoringService.calculateCreditScore({
    monthlyIncome: Number(user.monthlyIncome),
    totalDebt: Number(totalDebt),
    onTimePayments: profile.onTimePayments,
    latePayments: profile.latePayments,
  });

  const rate = config.creditScoring.defaultInterestRate;
  const monthlyPayment = amortizationService.calculateMonthlyPayment(amount, rate, termMonths);
  const totalToPay = amortizationService.calculateTotalToPay(amount, rate, termMonths);

  const evaluation = creditScoringService.evaluateLoanApproval(
    score,
    amount,
    Number(user.monthlyIncome),
    totalDebt,
    monthlyPayment
  );

  const loan = await prisma.loan.create({
    data: {
      userId,
      amount: Number(amount),
      termMonths,
      interestRate: rate,
      monthlyPayment,
      totalToPay,
      status: evaluation.approved ? 'APPROVED' : 'REJECTED',
      creditScoreAt: score,
      rejectionReason: evaluation.approved ? null : evaluation.reason,
      approvedAt: evaluation.approved ? new Date() : null,
    },
  });

  return { loan, evaluation };
}

async function getTotalActiveDebt(userId) {
  const result = await prisma.loan.aggregate({
    where: {
      userId,
      status: { in: ['ACTIVE', 'APPROVED'] },
    },
    _sum: { amount: true },
  });
  return result._sum.amount || 0;
}

async function disburseLoan(loanId, userId) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId },
    include: { schedule: true },
  });
  if (!loan) throw new Error('Préstamo no encontrado');
  if (loan.status !== 'APPROVED') throw new Error('Solo se pueden desembolsar préstamos aprobados');

  const firstDueDate = new Date();
  firstDueDate.setMonth(firstDueDate.getMonth() + 1);
  firstDueDate.setDate(1);

  const schedule = amortizationService.generateSchedule(
    loan.amount,
    Number(loan.interestRate),
    loan.termMonths,
    firstDueDate
  );

  const dueDate = schedule.length > 0 ? schedule[schedule.length - 1].dueDate : null;

  await prisma.$transaction([
    prisma.loan.update({
      where: { id: loanId },
      data: { status: 'ACTIVE', disbursedAt: new Date(), dueDate },
    }),
    ...schedule.map((item) =>
      prisma.amortizationItem.create({
        data: {
          loanId,
          installmentNumber: item.installmentNumber,
          dueDate: item.dueDate,
          principal: item.principal,
          interest: item.interest,
          totalDue: item.totalDue,
        },
      })
    ),
  ]);

  return prisma.loan.findUnique({
    where: { id: loanId },
    include: { schedule: true },
  });
}

async function getLoansByUser(userId, status) {
  const where = { userId };
  if (status) where.status = status;
  return prisma.loan.findMany({
    where,
    include: { schedule: { orderBy: { installmentNumber: 'asc' } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getLoanById(loanId, userId) {
  return prisma.loan.findFirst({
    where: { id: loanId, userId },
    include: { schedule: { orderBy: { installmentNumber: 'asc' } }, payments: true },
  });
}

async function recordPayment(userId, loanId, amount, itemId) {
  const loan = await prisma.loan.findFirst({
    where: { id: loanId, userId },
    include: { schedule: true, user: { include: { creditProfile: true } } },
  });
  if (!loan) throw new Error('Préstamo no encontrado');
  if (loan.status !== 'ACTIVE') throw new Error('Solo se pueden registrar pagos en préstamos activos');

  const item = itemId
    ? loan.schedule.find((s) => s.id === itemId)
    : loan.schedule.find((s) => Number(s.paidAmount) < Number(s.totalDue));

  if (!item) throw new Error('No hay cuotas pendientes o el ítem no existe');

  const due = Number(item.totalDue) - Number(item.paidAmount) + Number(item.latePenalty);
  const paid = Number(amount);
  const isLate = new Date() > new Date(item.dueDate);
  const daysLate = isLate ? Math.ceil((new Date() - new Date(item.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

  let penalty = Number(item.latePenalty);
  if (isLate && penalty === 0) {
    penalty = amortizationService.calculateLatePenalty(due, daysLate);
    await prisma.amortizationItem.update({
      where: { id: item.id },
      data: { latePenalty: penalty, isOverdue: true },
    });
  }

  let remaining = paid;
  const appliedToPenalty = Math.min(remaining, penalty);
  remaining -= appliedToPenalty;
  const appliedToInterest = Math.min(remaining, Number(item.interest));
  remaining -= appliedToInterest;
  const appliedToPrincipal = Math.min(remaining, Number(item.principal));

  await prisma.payment.create({
    data: {
      loanId,
      itemId: item.id,
      amount: paid,
      appliedToPrincipal,
      appliedToInterest,
      appliedToPenalty,
      isLate,
    },
  });

  const newPaidAmount = Number(item.paidAmount) + paid;
  await prisma.amortizationItem.update({
    where: { id: item.id },
    data: { paidAmount: newPaidAmount, paidAt: new Date() },
  });

  const profile = loan.user.creditProfile;
  const newOnTime = profile.onTimePayments + (isLate ? 0 : 1);
  const newLate = profile.latePayments + (isLate ? 1 : 0);
  const newScore = creditScoringService.updateScoreAfterPayment(
    profile.creditScore,
    !isLate,
    newOnTime,
    newLate
  );

  await prisma.creditProfile.update({
    where: { id: profile.id },
    data: {
      creditScore: newScore,
      onTimePayments: newOnTime,
      latePayments: newLate,
      totalDebt: await getTotalActiveDebt(userId),
      lastScoreUpdate: new Date(),
    },
  });

  const allPaid = loan.schedule.every((s) => {
    const total = Number(s.totalDue) + Number(s.latePenalty);
    return Number(s.paidAmount) >= total || (s.id === item.id && newPaidAmount >= total);
  });
  if (allPaid) {
    await prisma.loan.update({ where: { id: loanId }, data: { status: 'PAID' } });
  }

  return prisma.loan.findUnique({
    where: { id: loanId },
    include: { schedule: true, payments: true },
  });
}

async function getCreditProfile(userId) {
  let profile = await prisma.creditProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    profile = await prisma.creditProfile.create({
      data: { userId, creditScore: 50 },
    });
  }
  return profile;
}

module.exports = {
  requestLoan,
  disburseLoan,
  getLoansByUser,
  getLoanById,
  recordPayment,
  getCreditProfile,
  getTotalActiveDebt,
};
