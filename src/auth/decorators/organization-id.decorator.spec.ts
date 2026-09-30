import { ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants.js';
import { OrganizationId } from './organization-id.decorator.ts';

// createParamDecorator only stores a factory in the route metadata: read it back to test it
const factoryOf = (decorator: () => ParameterDecorator) => {
  class Target {
    handler(@decorator() _value: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Target, 'handler') as Record<
    string,
    { factory: (data: unknown, ctx: ExecutionContext) => unknown }
  >;
  return Object.values(args)[0].factory;
};

const buildContext = (request: Record<string, unknown>) =>
  ({ switchToHttp: () => ({ getRequest: () => request }) }) as unknown as ExecutionContext;

describe('@OrganizationId()', () => {
  const factory = factoryOf(OrganizationId);

  it('returns the organization of the verified token', () => {
    const organization_id = '6abd26a42d059ac027376ca1';
    expect(factory(undefined, buildContext({ user: { id: '1', organization_id } }))).toBe(organization_id);
  });

  it('rejects a token without organization with 403', () => {
    expect(() => factory(undefined, buildContext({ user: { id: '1' } }))).toThrow(ForbiddenException);
  });

  it('fails loudly when AuthGuard did not run', () => {
    expect(() => factory(undefined, buildContext({}))).toThrow(InternalServerErrorException);
  });
});
