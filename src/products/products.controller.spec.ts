import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller.js';
import { Reflector } from '@nestjs/core';
import { AlertsController } from './alerts.controller.ts';
import { AUTH_SERVICE, PRODUCTS_SERVICE } from '../config/index.ts';
import { AuthGuard } from '../auth/guards/auth.guard.ts';
import { RolesGuard } from '../auth/guards/roles.guard.ts';
import { ROLES_KEY } from '../auth/roles.ts';
import { Role } from '../generated/proto/auth.ts';

const rolesOf = (controller: Function, handler: string) =>
  new Reflector().getAllAndOverride<Role[]>(ROLES_KEY, [controller.prototype[handler], controller]);

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: PRODUCTS_SERVICE, useValue: { getService: () => ({}) } },
        { provide: AUTH_SERVICE, useValue: { getService: () => ({}) } },
        AuthGuard,
        RolesGuard,
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it.each(['findAllProducts', 'findOneProduct', 'adjustStock'])('lets any role use %s', (handler) => {
    expect(rolesOf(ProductsController, handler)).toEqual([]);
  });

  it.each(['createProduct', 'updateProduct', 'deleteProduct'])('restricts %s to owner and admin', (handler) => {
    expect(rolesOf(ProductsController, handler)).toEqual([Role.owner, Role.admin]);
  });

  it('lets any role read alerts', () => {
    expect(rolesOf(AlertsController, 'findAllAlerts')).toEqual([]);
  });
});
