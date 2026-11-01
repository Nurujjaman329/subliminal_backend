import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FlashSettingsDocument = HydratedDocument<FlashSettings>;

@Schema({ _id: false })
class FlashOption {
  @Prop({ required: true })
  label!: string;

  @Prop({ required: true })
  value!: string;

  @Prop({ default: true })
  enabled!: boolean;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ type: Number, required: false })
  ms?: number;

  @Prop({ type: Number, required: false })
  seconds?: number | null;

  @Prop({ type: String, required: false })
  mediaUrl?: string | null;

  @Prop({ type: Types.ObjectId, required: false })
  mediaAssetId?: Types.ObjectId | null;

  @Prop({ type: String, required: false })
  sourceType?: string | null;
}

@Schema({ _id: false })
class FlashSettingGroup {
  @Prop({ type: [FlashOption], default: [] })
  options!: FlashOption[];

  @Prop({ required: true })
  defaultValue!: string;
}

@Schema({ timestamps: true, collection: 'flash_settings' })
export class FlashSettings {
  @Prop({ required: true, unique: true, default: 'global' })
  key!: string;

  @Prop({ type: FlashSettingGroup, required: true })
  position!: FlashSettingGroup;

  @Prop({ type: FlashSettingGroup, required: true })
  showEvery!: FlashSettingGroup;

  @Prop({ type: FlashSettingGroup, required: true })
  imageSize!: FlashSettingGroup;

  @Prop({ type: FlashSettingGroup, required: true })
  sessionLength!: FlashSettingGroup;

  @Prop({ type: FlashSettingGroup, required: true })
  audioOptions!: FlashSettingGroup;

  @Prop({
    type: {
      enabled: { type: Boolean, default: false },
      defaultValue: { type: Boolean, default: false },
    },
    default: { enabled: false, defaultValue: false },
  })
  runOnStartUp!: { enabled: boolean; defaultValue: boolean };

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const FlashSettingsSchema = SchemaFactory.createForClass(FlashSettings);
