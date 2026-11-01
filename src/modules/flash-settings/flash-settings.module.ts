import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FlashSettings,
  FlashSettingsSchema,
} from './schemas/flash-settings.schema';
import { FlashSettingsService } from './flash-settings.service';
import { FlashSettingsController } from './flash-settings.controller';
import { AdminFlashSettingsController } from './admin-flash-settings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FlashSettings.name, schema: FlashSettingsSchema },
    ]),
  ],
  controllers: [FlashSettingsController, AdminFlashSettingsController],
  providers: [FlashSettingsService],
  exports: [FlashSettingsService, MongooseModule],
})
export class FlashSettingsModule {}
