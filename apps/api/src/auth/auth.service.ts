import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { EmployeeService } from '../employee/employee.service';
import { LoginDto } from './dto/login.dto';
import { Employee } from 'src/employee/entities/employee.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private employeeService: EmployeeService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const employee = await this.employeeService.findByEmail(loginDto.email);
    if (!employee) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      employee.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: employee.id, email: employee.email, position: employee.position };
    const accessToken = this.jwtService.sign(payload);

    return this.loginResponse(accessToken, employee);
  }

  private loginResponse(accessToken: string, employee: Employee) {
    return {
      success: true,
      data: {
        accessToken,
        expiresIn: process.env.JWT_EXPIRES_IN,
        user: {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          position: employee.position,
          photoUrl: employee.photoUrl,
        },
      }
    };
  }
}
