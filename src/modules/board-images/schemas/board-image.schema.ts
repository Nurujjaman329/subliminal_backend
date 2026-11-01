import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { OwnerType, SourceType } from '../../../common/constants/ownership';

export type BoardImageDocument = HydratedDocument<BoardImage>;

@Schema({ timestamps: true, collection: 'board_images' })
export class BoardImage {
  @Prop({ type: Types.ObjectId, ref: 'Board', required: true })
  boardId!: Types.ObjectId;

  @Prop({ required: true })
  url!: string;

  @Prop({ type: String, default: null })
  thumbUrl!: string | null;

  @Prop({ type: String, enum: SourceType, default: SourceType.URL })
  sourceType!: SourceType;

  @Prop({ type: String, default: null })
  originalFileName!: string | null;

  @Prop({ type: String, default: null })
  mimeType!: string | null;

  @Prop({ type: Number, default: null })
  sizeBytes!: number | null;

  @Prop({ type: String, enum: OwnerType, required: true })
  ownerType!: OwnerType;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  ownerId!: Types.ObjectId | null;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const BoardImageSchema = SchemaFactory.createForClass(BoardImage);
BoardImageSchema.index({ boardId: 1, ownerType: 1, ownerId: 1, order: 1 });
