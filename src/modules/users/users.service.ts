import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UserRole, UserStatus } from '../../common/constants/roles';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  create(data: Partial<User>) {
    return this.userModel.create(data);
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  findById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findByIdOrFail(id: string) {
    const user = await this.findById(id);
    if (!user || user.status === UserStatus.DELETED) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getProfile(userId: string) {
    const user = await this.findByIdOrFail(userId);
    return this.toPublic(user);
  }

  listUsers() {
    return this.userModel
      .find({ status: { $ne: UserStatus.DELETED } })
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .exec()
      .then((docs) => docs.map((u) => this.toPublic(u)));
  }

  async setStatus(userId: string, status: UserStatus) {
    const user = await this.findByIdOrFail(userId);
    user.status = status;
    await user.save();
    return user;
  }

  /** Admin: enable/disable a non-admin user */
  async setStatusByAdmin(
    adminId: string,
    userId: string,
    status: UserStatus.ACTIVE | UserStatus.DISABLED,
  ) {
    if (adminId === userId) {
      throw new BadRequestException('Cannot change your own status');
    }

    const user = await this.findByIdOrFail(userId);
    if (user.role === UserRole.ADMIN) {
      throw new ForbiddenException('Cannot change another admin account');
    }

    user.status = status;
    await user.save();
    return this.toPublic(user);
  }

  async touchLogin(userId: string, ip?: string) {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $set: { lastLoginAt: new Date(), lastLoginIp: ip ?? null },
        $inc: { loginCount: 1 },
      })
      .exec();
  }

  private toPublic(user: UserDocument) {
    return {
      id: user.id as string,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      createdAt: user.get('createdAt'),
    };
  }
}
