import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { BoardsModule } from './modules/boards/boards.module';
import { BoardImagesModule } from './modules/board-images/board-images.module';
import { MediaModule } from './modules/media/media.module';
import { FlashSettingsModule } from './modules/flash-settings/flash-settings.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URL') ??
          config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    BoardsModule,
    BoardImagesModule,
    MediaModule,
    FlashSettingsModule,
  ],
})
export class AppModule {}
