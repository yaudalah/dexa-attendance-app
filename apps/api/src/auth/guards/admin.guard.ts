import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { EmployeePosition } from '../../employee/entities/employee.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (user?.position !== EmployeePosition.ADMIN) {
      this.logger.warn(`User ${user?.id || 'unknown'} with position ${user?.position || 'unknown'} attempted to access admin-only route`);
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}
