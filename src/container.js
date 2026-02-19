/**
 * Composition Root – Inyección de dependencias por Bounded Context.
 */
const { PrismaClient } = require('@prisma/client');
const config = require('./config');

// Infraestructura (por contexto)
const BcryptPasswordHasher = require('./iam/infrastructure/auth/BcryptPasswordHasher');
const JwtTokenService = require('./iam/infrastructure/auth/JwtTokenService');
const PrismaUserRepository = require('./iam/infrastructure/persistence/PrismaUserRepository');
const PrismaAuditLogRepository = require('./audit/infrastructure/persistence/PrismaAuditLogRepository');
const PrismaClientRepository = require('./risk-scoring/infrastructure/persistence/PrismaClientRepository');
const PrismaClientCreditProfileRepository = require('./risk-scoring/infrastructure/persistence/PrismaClientCreditProfileRepository');
const PrismaCreditEvaluationRepository = require('./risk-scoring/infrastructure/persistence/PrismaCreditEvaluationRepository');
const PrismaLoanRepository = require('./credit-management/infrastructure/persistence/PrismaLoanRepository');
const PrismaInstallmentRepository = require('./credit-management/infrastructure/persistence/PrismaInstallmentRepository');
const PrismaPenaltyPolicyRepository = require('./credit-management/infrastructure/persistence/PrismaPenaltyPolicyRepository');
const PrismaPaymentRepository = require('./payments/infrastructure/persistence/PrismaPaymentRepository');
const PrismaCollectionActionRepository = require('./collection-debt-recovery/infrastructure/persistence/PrismaCollectionActionRepository');

// IAM
const RegisterUserUseCase = require('./iam/application/use-cases/RegisterUserUseCase');
const LoginUserUseCase = require('./iam/application/use-cases/LoginUserUseCase');
const GetCurrentUserUseCase = require('./iam/application/use-cases/GetCurrentUserUseCase');
const UpdateCurrentUserUseCase = require('./iam/application/use-cases/UpdateCurrentUserUseCase');

// Audit
const RecordAuditEventUseCase = require('./audit/application/use-cases/RecordAuditEventUseCase');

// Risk & Scoring
const CreditScoringDomainService = require('./risk-scoring/domain/services/CreditScoringDomainService');
const CreateClientUseCase = require('./risk-scoring/application/use-cases/CreateClientUseCase');
const GetScoringByClientUseCase = require('./risk-scoring/application/use-cases/GetScoringByClientUseCase');
const RecalculateScoringUseCase = require('./risk-scoring/application/use-cases/RecalculateScoringUseCase');
const EvaluateCreditUseCase = require('./risk-scoring/application/use-cases/EvaluateCreditUseCase');

// Credit Management
const AmortizationDomainService = require('./credit-management/domain/services/AmortizationDomainService');
const SimulateCreditUseCase = require('./credit-management/application/use-cases/SimulateCreditUseCase');
const CreateCreditUseCase = require('./credit-management/application/use-cases/CreateCreditUseCase');
const GetCreditsByClientUseCase = require('./credit-management/application/use-cases/GetCreditsByClientUseCase');
const GetCreditByIdUseCase = require('./credit-management/application/use-cases/GetCreditByIdUseCase');
const GetScheduleUseCase = require('./credit-management/application/use-cases/GetScheduleUseCase');
const ApproveCreditUseCase = require('./credit-management/application/use-cases/ApproveCreditUseCase');
const RejectCreditUseCase = require('./credit-management/application/use-cases/RejectCreditUseCase');
const DisburseCreditUseCase = require('./credit-management/application/use-cases/DisburseCreditUseCase');

// Payments
const RecordPaymentUseCase = require('./payments/application/use-cases/RecordPaymentUseCase');
const GetPaymentsByCreditUseCase = require('./payments/application/use-cases/GetPaymentsByCreditUseCase');
const GetPaymentByIdUseCase = require('./payments/application/use-cases/GetPaymentByIdUseCase');

// Collection
const RegisterCollectionActionUseCase = require('./collection-debt-recovery/application/use-cases/RegisterCollectionActionUseCase');
const GetCollectionActionsByClientUseCase = require('./collection-debt-recovery/application/use-cases/GetCollectionActionsByClientUseCase');
const GetCollectionActionsByCreditUseCase = require('./collection-debt-recovery/application/use-cases/GetCollectionActionsByCreditUseCase');

const prisma = new PrismaClient();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService(config.jwt.secret, config.jwt.expiresIn);

const userRepository = new PrismaUserRepository(prisma);
const auditLogRepository = new PrismaAuditLogRepository(prisma);
const clientRepository = new PrismaClientRepository(prisma);
const creditProfileRepository = new PrismaClientCreditProfileRepository(prisma);
const creditEvaluationRepository = new PrismaCreditEvaluationRepository(prisma);
const loanRepository = new PrismaLoanRepository(prisma);
const installmentRepository = new PrismaInstallmentRepository(prisma);
const penaltyPolicyRepository = new PrismaPenaltyPolicyRepository(prisma);
const paymentRepository = new PrismaPaymentRepository(prisma);
const collectionActionRepository = new PrismaCollectionActionRepository(prisma);

const creditScoringService = new CreditScoringDomainService(config.creditScoring);
const amortizationService = new AmortizationDomainService();

const registerUserUseCase = new RegisterUserUseCase({
  userRepository,
  passwordHasher,
  tokenService,
});
const loginUserUseCase = new LoginUserUseCase({
  userRepository,
  passwordHasher,
  tokenService,
});
const getCurrentUserUseCase = new GetCurrentUserUseCase({ userRepository });
const updateCurrentUserUseCase = new UpdateCurrentUserUseCase({ userRepository });

const recordAuditEventUseCase = new RecordAuditEventUseCase({ auditLogRepository });

const createClientUseCase = new CreateClientUseCase({ clientRepository });
const getScoringByClientUseCase = new GetScoringByClientUseCase({
  clientRepository,
  creditProfileRepository,
});
const recalculateScoringUseCase = new RecalculateScoringUseCase({
  clientRepository,
  creditProfileRepository,
  creditScoringService,
  loanRepository,
});
const evaluateCreditUseCase = new EvaluateCreditUseCase({
  clientRepository,
  creditProfileRepository,
  creditScoringService,
  creditEvaluationRepository,
  loanRepository,
});

const simulateCreditUseCase = new SimulateCreditUseCase({ amortizationService });
const createCreditUseCase = new CreateCreditUseCase({
  loanRepository,
  creditEvaluationRepository,
  amortizationService,
  penaltyPolicyRepository,
  defaultInterestRate: config.creditScoring.defaultInterestRate,
});
const getCreditsByClientUseCase = new GetCreditsByClientUseCase({ loanRepository });
const getCreditByIdUseCase = new GetCreditByIdUseCase({ loanRepository });
const getScheduleUseCase = new GetScheduleUseCase({ loanRepository, installmentRepository });
const approveCreditUseCase = new ApproveCreditUseCase({ loanRepository });
const rejectCreditUseCase = new RejectCreditUseCase({ loanRepository });
const disburseCreditUseCase = new DisburseCreditUseCase({
  loanRepository,
  installmentRepository,
  amortizationService,
});

const recordPaymentUseCase = new RecordPaymentUseCase({
  paymentRepository,
  installmentRepository,
  loanRepository,
});
const getPaymentsByCreditUseCase = new GetPaymentsByCreditUseCase({ paymentRepository });
const getPaymentByIdUseCase = new GetPaymentByIdUseCase({ paymentRepository });

const registerCollectionActionUseCase = new RegisterCollectionActionUseCase({
  collectionActionRepository,
});
const getCollectionActionsByClientUseCase = new GetCollectionActionsByClientUseCase({
  collectionActionRepository,
});
const getCollectionActionsByCreditUseCase = new GetCollectionActionsByCreditUseCase({
  collectionActionRepository,
});

module.exports = {
  tokenService,
  registerUserUseCase,
  loginUserUseCase,
  getCurrentUserUseCase,
  updateCurrentUserUseCase,
  recordAuditEventUseCase,
  createClientUseCase,
  getScoringByClientUseCase,
  recalculateScoringUseCase,
  evaluateCreditUseCase,
  simulateCreditUseCase,
  createCreditUseCase,
  getCreditsByClientUseCase,
  getCreditByIdUseCase,
  getScheduleUseCase,
  approveCreditUseCase,
  rejectCreditUseCase,
  disburseCreditUseCase,
  recordPaymentUseCase,
  getPaymentsByCreditUseCase,
  getPaymentByIdUseCase,
  registerCollectionActionUseCase,
  getCollectionActionsByClientUseCase,
  getCollectionActionsByCreditUseCase,
};
