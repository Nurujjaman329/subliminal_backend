import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Board, BoardDocument } from './schemas/board.schema';
import { CreatePersonalBoardDto } from './dto/create-personal-board.dto';
import { UpdatePersonalBoardDto } from './dto/update-personal-board.dto';
import { BoardKind, OwnerType, SourceType } from '../../common/constants/ownership';

@Injectable()
export class BoardsService {
  constructor(@InjectModel(Board.name) private readonly boardModel: Model<BoardDocument>) {}

  /** System boards + current user's personal boards */
  listForUser(userId: string) {
    return this.boardModel
      .find({
        isActive: true,
        $or: [
          { boardKind: BoardKind.SYSTEM, ownerType: OwnerType.ADMIN },
          {
            boardKind: BoardKind.PERSONAL,
            ownerType: OwnerType.USER,
            ownerId: new Types.ObjectId(userId),
          },
        ],
      })
      .sort({ boardKind: 1, order: 1, createdAt: -1 })
      .exec();
  }

  async createPersonal(userId: string, dto: CreatePersonalBoardDto) {
    const doc = new this.boardModel({
      title: dto.title,
      coverUrl: dto.coverUrl ?? null,
      coverSourceType: dto.coverUrl ? SourceType.URL : null,
      boardKind: BoardKind.PERSONAL,
      ownerType: OwnerType.USER,
      ownerId: new Types.ObjectId(userId),
      order: 0,
      isActive: true,
      createdBy: new Types.ObjectId(userId),
      updatedBy: new Types.ObjectId(userId),
    });
    return doc.save();
  }

  async updatePersonal(userId: string, boardId: string, dto: UpdatePersonalBoardDto) {
    const board = await this.getOwnedPersonalOrFail(userId, boardId);
    if (dto.title !== undefined) board.title = dto.title;
    if (dto.coverUrl !== undefined) {
      board.coverUrl = dto.coverUrl;
      board.coverSourceType = dto.coverUrl ? SourceType.URL : null;
    }
    if (dto.isActive !== undefined) board.isActive = dto.isActive;
    board.updatedBy = new Types.ObjectId(userId);
    await board.save();
    return board;
  }

  async deletePersonal(userId: string, boardId: string) {
    const board = await this.getOwnedPersonalOrFail(userId, boardId);
    await board.deleteOne();
    return { deleted: true, id: boardId };
  }

  /** Admin: create a shared system board */
  async createSystem(
    adminId: string,
    data: {
      title: string;
      coverUrl?: string | null;
      coverSourceType?: SourceType | null;
      order?: number;
    },
  ) {
    const maxOrder = await this.boardModel
      .findOne({ boardKind: BoardKind.SYSTEM })
      .sort({ order: -1 })
      .select('order')
      .exec();

    const doc = new this.boardModel({
      title: data.title.trim(),
      coverUrl: data.coverUrl ?? null,
      coverSourceType: data.coverSourceType ?? null,
      boardKind: BoardKind.SYSTEM,
      ownerType: OwnerType.ADMIN,
      ownerId: null,
      order: data.order ?? (maxOrder?.order ?? -1) + 1,
      isActive: true,
      createdBy: new Types.ObjectId(adminId),
      updatedBy: new Types.ObjectId(adminId),
    });
    return doc.save();
  }

  /** Admin: update a system board */
  async updateSystem(
    adminId: string,
    boardId: string,
    data: {
      title?: string;
      coverUrl?: string | null;
      coverSourceType?: SourceType | null;
      isActive?: boolean;
    },
  ) {
    const board = await this.getSystemOrFail(boardId);
    if (data.title !== undefined) board.title = data.title.trim();
    if (data.coverUrl !== undefined) {
      board.coverUrl = data.coverUrl;
      board.coverSourceType =
        data.coverSourceType ??
        (data.coverUrl ? SourceType.URL : null);
    }
    if (data.isActive !== undefined) board.isActive = data.isActive;
    board.updatedBy = new Types.ObjectId(adminId);
    await board.save();
    return board;
  }

  /** Admin: hard-delete a system board */
  async deleteSystem(boardId: string) {
    const board = await this.getSystemOrFail(boardId);
    await board.deleteOne();
    return { deleted: true, id: boardId };
  }

  private async getSystemOrFail(boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    if (board.boardKind !== BoardKind.SYSTEM) {
      throw new ForbiddenException('Not a system board');
    }
    return board;
  }

  async getAccessibleBoardOrFail(userId: string, boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board || !board.isActive) {
      throw new NotFoundException('Board not found');
    }
    if (board.boardKind === BoardKind.SYSTEM) {
      return board;
    }
    if (
      board.boardKind === BoardKind.PERSONAL &&
      board.ownerId?.toString() === userId
    ) {
      return board;
    }
    throw new ForbiddenException('You cannot access this board');
  }

  private async getOwnedPersonalOrFail(userId: string, boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) {
      throw new NotFoundException('Board not found');
    }
    if (board.boardKind !== BoardKind.PERSONAL || board.ownerId?.toString() !== userId) {
      throw new ForbiddenException('Only the owner can modify this personal board');
    }
    return board;
  }
}
