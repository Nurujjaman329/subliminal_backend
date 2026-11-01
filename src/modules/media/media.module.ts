import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MediaAsset, MediaAssetSchema } from './schemas/media-asset.schema';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { AdminMediaController } from './admin-media.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MediaAsset.name, schema: MediaAssetSchema }]),
  ],
  controllers: [MediaController, AdminMediaController],
  providers: [MediaService],
  exports: [MediaService, MongooseModule],
})
export class MediaModule {}
