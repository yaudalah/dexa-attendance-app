import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  Logger
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Controller('employees')
export class EmployeeController {
  private readonly logger = new Logger(EmployeeController.name);
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    this.logger.log(`Fetching employees - Page: ${page || 1}, Limit: ${limit || 10}`);
    return this.employeeService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: { user: { id: string } }) {
    return this.employeeService.findById(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @Req() req: { user: { id: string; position: string } },
  ) {
    const isAdmin = req.user.position === 'admin';
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('Forbidden');
    }
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Post(':id/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('photo'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { id: string; position: string } },
  ) {
    const isAdmin = req.user.position === 'admin';
    if (!isAdmin && req.user.id !== id) {
      throw new ForbiddenException('Forbidden');
    }
    return this.employeeService.uploadPhoto(id, file);
  }
}
