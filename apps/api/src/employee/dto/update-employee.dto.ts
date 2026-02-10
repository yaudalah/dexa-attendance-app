import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateEmployeeDto } from './create-employee.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateEmployeeDto extends PartialType(
  OmitType(CreateEmployeeDto, ['password']),
) {
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password?: string;
}
