import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema';
import { MediaType } from '../../common/constants/ownership';

@Injectable()
export class MediaService {
  constructor(
    @InjectModel(MediaAsset.name)
    private readonly mediaModel: Model<MediaAssetDocument>,
  ) {}

  async getActiveMeditation() {
    const [image, video] = await Promise.all([
      this.mediaModel
        .findOne({ type: MediaType.MEDITATION_IMAGE, isActive: true })
        .sort({ updatedAt: -1 })
        .exec(),
      this.mediaModel
        .findOne({ type: MediaType.MEDITATION_VIDEO, isActive: true })
        .sort({ updatedAt: -1 })
        .exec(),
    ]);

    return {
      image: image
        ? {
            id: image.id as string,
            title: image.title,
            url: image.url,
            sourceType: image.sourceType,
            thumbUrl: image.thumbUrl,
          }
        : null,
      video: video
        ? {
            id: video.id as string,
            title: video.title,
            url: video.url,
            sourceType: video.sourceType,
            thumbUrl: video.thumbUrl,
            durationSeconds: video.durationSeconds,
          }
        : null,
    };
  }
}
