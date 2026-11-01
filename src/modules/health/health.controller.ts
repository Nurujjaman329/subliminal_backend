import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      service: 'subliminal-backend',
      timestamp: new Date().toISOString(),
    };
  }
}
