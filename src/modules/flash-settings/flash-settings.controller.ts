import { Controller, Get, UseGuards } from '@nestjs/common';
import { FlashSettingsService } from './flash-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('flash-settings')
@UseGuards(JwtAuthGuard)
export class FlashSettingsController {
  constructor(private readonly flashSettingsService: FlashSettingsService) {}

  @Get()
  get() {
    return this.flashSettingsService.getGlobal();
  }
}
