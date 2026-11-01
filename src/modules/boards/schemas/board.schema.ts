import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { BoardKind, OwnerType, SourceType } from '../../../common/constants/ownership';

export type BoardDocument = HydratedDocument<Board>;

@Schema({ timestamps: true, collection: 'boards' })
export class Board {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ type: String, default: null })
  coverUrl!: string | null;

  @Prop({ type: String, enum: SourceType, default: null })
  coverSourceType!: SourceType | null;

  @Prop({ type: String, enum: BoardKind, required: true })
  boardKind!: BoardKind;

  @Prop({ type: String, enum: OwnerType, required: true })
  ownerType!: OwnerType;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  ownerId!: Types.ObjectId | null;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const BoardSchema = SchemaFactory.createForClass(Board);
BoardSchema.index({ boardKind: 1, isActive: 1, order: 1 });
BoardSchema.index({ ownerId: 1, boardKind: 1 });
