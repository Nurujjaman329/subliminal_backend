import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { MediaType, OwnerType, SourceType } from '../../../common/constants/ownership';

export type MediaAssetDocument = HydratedDocument<MediaAsset>;

@Schema({ timestamps: true, collection: 'media_assets' })
export class MediaAsset {
  @Prop({ type: String, enum: MediaType, required: true })
  type!: MediaType;

  @Prop({ type: String, default: null })
  category!: string | null;

  @Prop({ required: true })
  title!: string;

  @Prop({ type: String, enum: SourceType, required: true })
  sourceType!: SourceType;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: String, default: null })
  thumbUrl!: string | null;

  @Prop({ type: String, default: null })
  originalFileName!: string | null;

  @Prop({ type: String, default: null })
  mimeType!: string | null;

  @Prop({ type: Number, default: null })
  sizeBytes!: number | null;

  @Prop({ type: Number, default: null })
  durationSeconds!: number | null;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: String, enum: OwnerType, default: OwnerType.ADMIN })
  ownerType!: OwnerType;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
MediaAssetSchema.index({ type: 1, isActive: 1 });
MediaAssetSchema.index({ category: 1, isActive: 1 });
