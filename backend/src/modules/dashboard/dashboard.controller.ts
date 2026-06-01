import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly svc: DashboardService) {}

  @Get('kpis')
  kpis() {
    return this.svc.kpis();
  }

  @Get('leads-by-source')
  bySource() {
    return this.svc.leadsBySource();
  }

  @Get('leads-by-stage')
  byStage() {
    return this.svc.leadsByStage();
  }
}
