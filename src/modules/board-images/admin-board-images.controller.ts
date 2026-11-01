import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { BoardImagesService } from './board-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles';
import { CreateAdminBoardImageDto } from './dto/create-admin-board-image.dto';
import { SourceType } from '../../common/constants/ownership';
import {
  diskUpload,
  publicUploadUrl,
} from '../../common/upload/multer.config';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminBoardImagesController {
  constructor(
    private readonly boardImagesService: BoardImagesService,
    private readonly config: ConfigService,
  ) {}

  @Post('admin/boards/:boardId/images')
  @UseInterceptors(FileInterceptor('image', diskUpload('board-images')))
  add(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
    @Body() dto: CreateAdminBoardImageDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:8080');
    let url = dto.url?.trim() || '';
    let sourceType = SourceType.URL;

    if (file) {
      url = publicUploadUrl(appUrl, 'board-images', file.filename);
      sourceType = SourceType.FILE;
    }

    if (!url) {
      throw new BadRequestException('Provide image URL or upload a file');
    }

    return this.boardImagesService.addAdminImage(user.userId, boardId, {
      url,
      sourceType,
      originalFileName: file?.originalname ?? null,
      mimeType: file?.mimetype ?? null,
      sizeBytes: file?.size ?? null,
      order: dto.order,
    });
  }

  @Delete('admin/board-images/:id')
  remove(@Param('id') id: string) {
    return this.boardImagesService.deleteAdminImage(id);
  }
}
