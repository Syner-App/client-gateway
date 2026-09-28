import { ArgumentsHost, Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { status } from '@grpc/grpc-js';
import type { Response } from 'express';

interface GrpcError {
  code: number;
  details: string;
}

const GRPC_TO_HTTP_STATUS: Partial<Record<status, HttpStatus>> = {
  [status.INVALID_ARGUMENT]: HttpStatus.BAD_REQUEST,
  [status.FAILED_PRECONDITION]: HttpStatus.BAD_REQUEST,
  [status.OUT_OF_RANGE]: HttpStatus.BAD_REQUEST,
  [status.UNAUTHENTICATED]: HttpStatus.UNAUTHORIZED,
  [status.PERMISSION_DENIED]: HttpStatus.FORBIDDEN,
  [status.NOT_FOUND]: HttpStatus.NOT_FOUND,
  [status.ALREADY_EXISTS]: HttpStatus.CONFLICT,
  [status.ABORTED]: HttpStatus.CONFLICT,
  [status.RESOURCE_EXHAUSTED]: HttpStatus.TOO_MANY_REQUESTS,
  [status.UNIMPLEMENTED]: HttpStatus.NOT_IMPLEMENTED,
  [status.UNAVAILABLE]: HttpStatus.SERVICE_UNAVAILABLE,
  [status.DEADLINE_EXCEEDED]: HttpStatus.GATEWAY_TIMEOUT,
};

const isGrpcError = (exception: unknown): exception is GrpcError =>
  typeof exception === 'object' &&
  exception !== null &&
  typeof (exception as GrpcError).code === 'number' &&
  typeof (exception as GrpcError).details === 'string';

@Catch()
export class GrpcExceptionFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (!isGrpcError(exception)) {
      return super.catch(exception, host);
    }

    const statusCode =
      GRPC_TO_HTTP_STATUS[exception.code as status] ??
      HttpStatus.INTERNAL_SERVER_ERROR;

    host
      .switchToHttp()
      .getResponse<Response>()
      .status(statusCode)
      .json({ statusCode, message: exception.details });
  }
}
