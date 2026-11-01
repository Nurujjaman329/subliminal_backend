import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BoardImage, BoardImageDocument } from './schemas/board-image.schema';
import { BoardsService } from '../boards/boards.service';
import { CreateBoardImageDto } from './dto/create-board-image.dto';
import { OwnerType, SourceType } from '../../common/constants/ownership';

@Injectable()
export class BoardImagesService {
  constructor(
    @InjectModel(BoardImage.name)
    private readonly boardImageModel: Model<BoardImageDocument>,
    private readonly boardsService: BoardsService,
  ) {}

  /** Admin images for board + current user's images */
  async listForBoard(userId: string, boardId: string) {
    await this.boardsService.getAccessibleBoardOrFail(userId, boardId);
    return this.boardImageModel
      .find({
        boardId: new Types.ObjectId(boardId),
        isActive: true,
        $or: [
          { ownerType: OwnerType.ADMIN },
          { ownerType: OwnerType.USER, ownerId: new Types.ObjectId(userId) },
        ],
      })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  async addUserImage(userId: string, boardId: string, dto: CreateBoardImageDto) {
    await this.boardsService.getAccessibleBoardOrFail(userId, boardId);
    return this.boardImageModel.create({
      boardId: new Types.ObjectId(boardId),
      url: dto.url,
      thumbUrl: dto.thumbUrl ?? null,
      sourceType: SourceType.URL,
      ownerType: OwnerType.USER,
      ownerId: new Types.ObjectId(userId),
      order: dto.order ?? 0,
      isActive: true,
    });
  }

  async deleteUserImage(userId: string, imageId: string) {
    const image = await this.boardImageModel.findById(imageId).exec();
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    if (image.ownerType !== OwnerType.USER || image.ownerId?.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own images');
    }
    await image.deleteOne();
    return { deleted: true, id: imageId };
  }
}
