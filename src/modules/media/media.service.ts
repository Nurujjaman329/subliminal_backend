import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MediaAsset, MediaAssetDocument } from './schemas/media-asset.schema';
import {
  MediaType,
  OwnerType,
  SourceType,
} from '../../common/constants/ownership';

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
      image: image ? this.toPublic(image) : null,
      video: video ? this.toPublic(video) : null,
    };
  }

  /** Admin: set active meditation preview image (deactivates previous) */
  async setMeditationImage(
    adminId: string,
    data: {
      url: string;
      sourceType: SourceType;
      title?: string;
      originalFileName?: string | null;
      mimeType?: string | null;
      sizeBytes?: number | null;
    },
  ) {
    return this.upsertActiveMedia(adminId, MediaType.MEDITATION_IMAGE, {
      ...data,
      title: data.title?.trim() || 'Meditation preview',
    });
  }

  /** Admin: set active meditation video */
  async setMeditationVideo(
    adminId: string,
    data: {
      url: string;
      sourceType: SourceType;
      title?: string;
      originalFileName?: string | null;
      mimeType?: string | null;
      sizeBytes?: number | null;
    },
  ) {
    return this.upsertActiveMedia(adminId, MediaType.MEDITATION_VIDEO, {
      ...data,
      title: data.title?.trim() || 'Meditation session video',
    });
  }

  async clearMeditationImage() {
    await this.mediaModel
      .updateMany(
        { type: MediaType.MEDITATION_IMAGE, isActive: true },
        { $set: { isActive: false } },
      )
      .exec();
    return { cleared: true, type: MediaType.MEDITATION_IMAGE };
  }

  async clearMeditationVideo() {
    await this.mediaModel
      .updateMany(
        { type: MediaType.MEDITATION_VIDEO, isActive: true },
        { $set: { isActive: false } },
      )
      .exec();
    return { cleared: true, type: MediaType.MEDITATION_VIDEO };
  }

  private async upsertActiveMedia(
    adminId: string,
    type: MediaType.MEDITATION_IMAGE | MediaType.MEDITATION_VIDEO,
    data: {
      url: string;
      sourceType: SourceType;
      title: string;
      originalFileName?: string | null;
      mimeType?: string | null;
      sizeBytes?: number | null;
    },
  ) {
    await this.mediaModel
      .updateMany({ type, isActive: true }, { $set: { isActive: false } })
      .exec();

    const doc = await this.mediaModel.create({
      type,
      category: 'meditation',
      title: data.title,
      sourceType: data.sourceType,
      url: data.url,
      thumbUrl: null,
      originalFileName: data.originalFileName ?? null,
      mimeType: data.mimeType ?? null,
      sizeBytes: data.sizeBytes ?? null,
      durationSeconds: null,
      isActive: true,
      ownerType: OwnerType.ADMIN,
      createdBy: new Types.ObjectId(adminId),
      updatedBy: new Types.ObjectId(adminId),
    });

    return this.toPublic(doc);
  }

  private toPublic(doc: MediaAssetDocument) {
    return {
      id: doc.id as string,
      title: doc.title,
      url: doc.url,
      sourceType: doc.sourceType,
      thumbUrl: doc.thumbUrl,
      durationSeconds: doc.durationSeconds,
      type: doc.type,
    };
  }
}
