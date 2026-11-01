import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole, UserStatus } from '../../../common/constants/roles';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ type: String, default: null })
  passwordHash!: string | null;

  @Prop({ type: String, default: null })
  name!: string | null;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: String, enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop({ default: true })
  emailVerified!: boolean;

  @Prop({ type: Date, default: null })
  emailVerifiedAt!: Date | null;

  @Prop({
    type: [
      {
        provider: String,
        providerUserId: String,
        email: String,
        linkedAt: Date,
      },
    ],
    default: [],
  })
  authProviders!: Array<{
    provider: string;
    providerUserId: string;
    email?: string | null;
    linkedAt: Date;
  }>;

  @Prop({ type: Date, default: null })
  passwordChangedAt!: Date | null;

  @Prop({ type: String, default: 'none' })
  subscriptionStatus!: string;

  @Prop({ type: String, default: null })
  subscriptionPlatform!: string | null;

  @Prop({ type: Date, default: null })
  trialEndsAt!: Date | null;

  @Prop({ type: Date, default: null })
  subscriptionExpiresAt!: Date | null;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  @Prop({ type: String, default: null })
  lastLoginIp!: string | null;

  @Prop({ default: 0 })
  loginCount!: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
