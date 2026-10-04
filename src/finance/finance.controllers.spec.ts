import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { FinanceLedgerController } from './finance-ledger.controller.ts';
import { FinanceOperationsController } from './finance-operations.controller.ts';
import { FinanceReportsController } from './finance-reports.controller.ts';
import { AUTH_SERVICE, FINANCE_SERVICE } from '../config/index.ts';
import { AuthGuard } from '../auth/guards/auth.guard.ts';
import { RolesGuard } from '../auth/guards/roles.guard.ts';
import { ROLES_KEY } from '../auth/roles.ts';
import { Role } from '../generated/proto/auth.ts';

const rolesOf = (controller: Function, handler: string) =>
  new Reflector().getAllAndOverride<Role[]>(ROLES_KEY, [controller.prototype[handler], controller]);

const MANAGERS = [Role.owner, Role.admin];
const OWNER = [Role.owner];

describe('Finance controllers', () => {
  const financeService = {
    registerExpense: vi.fn(),
    transferReserve: vi.fn(),
    registerWithdrawal: vi.fn(),
    updateRecipe: vi.fn(),
    getScenarios: vi.fn(),
  };
  let ledger: FinanceLedgerController;
  let operations: FinanceOperationsController;
  let reports: FinanceReportsController;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinanceLedgerController, FinanceOperationsController, FinanceReportsController],
      providers: [
        { provide: FINANCE_SERVICE, useValue: { getService: () => financeService } },
        { provide: AUTH_SERVICE, useValue: { getService: () => ({}) } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();
    module.get(FinanceLedgerController).onModuleInit();
    module.get(FinanceOperationsController).onModuleInit();
    module.get(FinanceReportsController).onModuleInit();

    ledger = module.get(FinanceLedgerController);
    operations = module.get(FinanceOperationsController);
    reports = module.get(FinanceReportsController);
  });

  it('lets any member register sales and read the recipes', () => {
    expect(rolesOf(FinanceOperationsController, 'registerSale')).toEqual([]);
    expect(rolesOf(FinanceOperationsController, 'findRecipes')).toEqual([]);
  });

  it.each([
    [FinanceLedgerController, ['registerExpense', 'payExpense', 'findMovements']],
    [
      FinanceOperationsController,
      ['findSupplies', 'upsertSupply', 'createRecipe', 'updateRecipe', 'findSales', 'retrySaleStock', 'findPayables', 'payPayable', 'findCredits', 'payInstallment'],
    ],
    [
      FinanceReportsController,
      ['getAssumptions', 'setAssumptions', 'getPolicy', 'getIncomeStatement', 'getWaterfall', 'getBreakEven', 'getScenarios', 'getDashboard'],
    ],
  ] as const)('restricts the operation and the reports of %O to owner and admin', (controller, handlers) => {
    for (const handler of handlers) expect(rolesOf(controller, handler)).toEqual(MANAGERS);
  });

  it.each([
    [FinanceLedgerController, ['registerContribution', 'transferReserve', 'registerWithdrawal', 'closePeriod', 'reopenPeriod']],
    [FinanceOperationsController, ['createCredit', 'prepayCredit', 'updateCredit', 'deleteCredit']],
    [FinanceReportsController, ['updatePolicy']],
  ] as const)('restricts the money decisions of %O to the owner', (controller, handlers) => {
    for (const handler of handlers) expect(rolesOf(controller, handler)).toEqual(OWNER);
  });

  it('sends the organization of the token and the proto3 defaults', () => {
    const organization_id = '6abd26a42d059ac027376ca1';

    void ledger.registerExpense({ categoria: 'ARRIENDO' as never, monto: 800_000 }, organization_id);
    void ledger.transferReserve({ monto: 100_000, cuenta: 'CAJA' as never }, organization_id);
    void ledger.registerWithdrawal({ monto: 100_000, cuenta: 'BANCO' as never }, organization_id);
    void operations.updateRecipe(1, { precio_venta: 5500 }, organization_id);
    void reports.getScenarios({}, organization_id);

    expect(financeService.registerExpense).toHaveBeenCalledWith(expect.objectContaining({ organization_id, pagado: false }));
    expect(financeService.transferReserve).toHaveBeenCalledWith(expect.objectContaining({ organization_id, hacia_reserva: true }));
    expect(financeService.registerWithdrawal).toHaveBeenCalledWith(expect.objectContaining({ organization_id, forzar: false }));
    expect(financeService.updateRecipe).toHaveBeenCalledWith({ precio_venta: 5500, items: [], id: 1, organization_id });
    expect(financeService.getScenarios).toHaveBeenCalledWith({ niveles: [], organization_id });
  });
});
