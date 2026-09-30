import {
  Body,
  Controller,
  Get,
  Inject,
  OnModuleInit,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { AUTH_SERVICE } from '../config/index.ts';
import {
  AUTH_SERVICE_NAME,
  type AuthServiceClient,
  type User as UserResponse,
} from '../generated/proto/auth.ts';
import { LoginUserDto, RegisterUserDto } from './dtos/index.ts';
import { AuthGuard } from './guards/auth.guard.ts';
import { Token, User } from './decorators/index.ts';

@Controller('auth')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class AuthController implements OnModuleInit {
  private authService: AuthServiceClient;

  constructor(@Inject(AUTH_SERVICE) private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.authService = this.client.getService<AuthServiceClient>(AUTH_SERVICE_NAME);
  }

  @Post('register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  // AuthGuard already verified the token with auth-ms and got a renewed one
  @UseGuards(AuthGuard)
  @Get('verify')
  verifyToken(@User() user: UserResponse, @Token() token: string) {
    return { user, token };
  }
}
