/**
 * Composition Root - Inyección de dependencias (DDD)
 */
const { PrismaClient } = require('@prisma/client');
const CreditScoringConfig = require('./domain/value-objects/CreditScoringConfig');
const CreditScoringDomainService = require('./domain/services/CreditScoringDomainService');
const AmortizationDomainService = require('./domain/services/AmortizationDomainService');
const PrismaUserRepository = require('./infrastructure/persistence/PrismaUserRepository');
const PrismaCreditProfileRepository = require('./infrastructure/persistence/PrismaCreditProfileRepository');
const PrismaLoanRepository = require('./infrastructure/persistence/PrismaLoanRepository');
const JwtTokenService = require('./infrastructure/auth/JwtTokenService');
const BcryptPasswordHasher = require('./infrastructure/auth/BcryptPasswordHasher');
const RegisterUserUseCase = require('./application/use-cases/auth/RegisterUserUseCase');
const LoginUserUseCase = require('./application/use-cases/auth/LoginUserUseCase');
const RequestLoanUseCase = require('./application/use-cases/loans/RequestLoanUseCase');
const DisburseLoanUseCase = require('./application/use-cases/loans/DisburseLoanUseCase');
const RecordPaymentUseCase = require('./application/use-cases/loans/RecordPaymentUseCase');
const GetLoansUseCase = require('./application/use-cases/loans/GetLoansUseCase');
const GetLoanByIdUseCase = require('./application/use-cases/loans/GetLoanByIdUseCase');
const GetCreditProfileUseCase = require('./application/use-cases/loans/GetCreditProfileUseCase');
const GetCurrentUserUseCase = require('./application/use-cases/auth/GetCurrentUserUseCase');

const config = require('./config');

const prisma = new PrismaClient();
const creditScoringConfig = new CreditScoringConfig(config.creditScoring);
const creditScoringService = new CreditScoringDomainService(creditScoringConfig);
const amortizationService = new AmortizationDomainService(creditScoringConfig);

const userRepository = new PrismaUserRepository(prisma);
const creditProfileRepository = new PrismaCreditProfileRepository(prisma);
const loanRepository = new PrismaLoanRepository(prisma);
const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordHasher();

const registerUserUseCase = new RegisterUserUseCase({
  userRepository,
  creditProfileRepository,
  passwordHasher,
  tokenService,
});

const loginUserUseCase = new LoginUserUseCase({
  userRepository,
  passwordHasher,
  tokenService,
});

const requestLoanUseCase = new RequestLoanUseCase({
  userRepository,
  creditProfileRepository,
  loanRepository,
  creditScoringService,
  amortizationService,
  config: creditScoringConfig,
});

const disburseLoanUseCase = new DisburseLoanUseCase({
  loanRepository,
  amortizationService,
});

const recordPaymentUseCase = new RecordPaymentUseCase({
  loanRepository,
  creditProfileRepository,
  creditScoringService,
  amortizationService,
});

const getLoansUseCase = new GetLoansUseCase({ loanRepository });
const getLoanByIdUseCase = new GetLoanByIdUseCase({ loanRepository });
const getCreditProfileUseCase = new GetCreditProfileUseCase({ creditProfileRepository });
const getCurrentUserUseCase = new GetCurrentUserUseCase({ userRepository });

module.exports = {
  registerUserUseCase,
  loginUserUseCase,
  requestLoanUseCase,
  disburseLoanUseCase,
  recordPaymentUseCase,
  getLoansUseCase,
  getLoanByIdUseCase,
  getCreditProfileUseCase,
  getCurrentUserUseCase,
  tokenService,
  userRepository,
};
