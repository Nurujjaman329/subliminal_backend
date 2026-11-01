import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
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
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBoardImageDto } from './dto/create-board-image.dto';
import { SourceType } from '../../common/constants/ownership';
import {
  diskUpload,
  publicUploadUrl,
} from '../../common/upload/multer.config';

@Controller()
@UseGuards(JwtAuthGuard)
export class BoardImagesController {
  constructor(
    private readonly boardImagesService: BoardImagesService,
    private readonly config: ConfigService,
  ) {}

  @Get('boards/:boardId/images')
  list(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
  ) {
    return this.boardImagesService.listForBoard(user.userId, boardId);
  }

  @Post('boards/:boardId/images')
  @UseInterceptors(FileInterceptor('image', diskUpload('board-images')))
  add(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
    @Body() dto: CreateBoardImageDto,
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

    return this.boardImagesService.addUserImage(user.userId, boardId, {
      url,
      sourceType,
      thumbUrl: dto.thumbUrl,
      order: dto.order,
      originalFileName: file?.originalname ?? null,
      mimeType: file?.mimetype ?? null,
      sizeBytes: file?.size ?? null,
    });
  }

  @Delete('board-images/:id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.boardImagesService.deleteUserImage(user.userId, id);
  }
}
