import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { BoardsService } from './boards.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles';
import { CreateSystemBoardDto } from './dto/create-system-board.dto';
import { UpdateSystemBoardDto } from './dto/update-system-board.dto';
import { SourceType } from '../../common/constants/ownership';
import {
  diskUpload,
  publicUploadUrl,
} from '../../common/upload/multer.config';

@Controller('admin/boards')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminBoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('cover', diskUpload('boards')))
  create(
    @CurrentUser() user: { userId: string },
    @Body() dto: CreateSystemBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:8080');
    let coverUrl = dto.coverUrl?.trim() || null;
    let coverSourceType: SourceType | null = coverUrl ? SourceType.URL : null;

    if (file) {
      coverUrl = publicUploadUrl(appUrl, 'boards', file.filename);
      coverSourceType = SourceType.FILE;
    }

    return this.boardsService.createSystem(user.userId, {
      title: dto.title,
      coverUrl,
      coverSourceType,
    });
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('cover', diskUpload('boards')))
  update(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateSystemBoardDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:8080');
    const data: {
      title?: string;
      coverUrl?: string | null;
      coverSourceType?: SourceType | null;
      isActive?: boolean;
    } = {};

    if (dto.title !== undefined) data.title = dto.title;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (file) {
      data.coverUrl = publicUploadUrl(appUrl, 'boards', file.filename);
      data.coverSourceType = SourceType.FILE;
    } else if (dto.coverUrl !== undefined) {
      data.coverUrl = dto.coverUrl.trim() || null;
      data.coverSourceType = data.coverUrl ? SourceType.URL : null;
    }

    return this.boardsService.updateSystem(user.userId, id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.deleteSystem(id);
  }
}
