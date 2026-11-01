import { Body, Controller, Put, UseGuards } from '@nestjs/common';
import { FlashSettingsService } from './flash-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles';
import { UpdateFlashSettingsDto } from './dto/update-flash-settings.dto';

@Controller('admin/flash-settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminFlashSettingsController {
  constructor(private readonly flashSettingsService: FlashSettingsService) {}

  @Put()
  update(
    @CurrentUser() user: { userId: string },
    @Body() dto: UpdateFlashSettingsDto,
  ) {
    return this.flashSettingsService.updateGlobal(user.userId, dto);
  }
}
