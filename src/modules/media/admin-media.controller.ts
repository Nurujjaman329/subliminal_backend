import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/roles';
import { SetMeditationMediaDto } from './dto/set-meditation-media.dto';
import { SourceType } from '../../common/constants/ownership';
import {
  diskUpload,
  publicUploadUrl,
} from '../../common/upload/multer.config';

@Controller('admin/media/meditation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminMediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly config: ConfigService,
  ) {}

  @Put('image')
  @UseInterceptors(FileInterceptor('file', diskUpload('meditation', 25 * 1024 * 1024)))
  setImage(
    @CurrentUser() user: { userId: string },
    @Body() dto: SetMeditationMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const resolved = this.resolveUrlOrFile(dto, file, 'meditation');
    return this.mediaService.setMeditationImage(user.userId, {
      url: resolved.url,
      sourceType: resolved.sourceType,
      title: dto.title,
      originalFileName: file?.originalname ?? null,
      mimeType: file?.mimetype ?? null,
      sizeBytes: file?.size ?? null,
    });
  }

  @Put('video')
  @UseInterceptors(
    FileInterceptor('file', diskUpload('meditation', 120 * 1024 * 1024)),
  )
  setVideo(
    @CurrentUser() user: { userId: string },
    @Body() dto: SetMeditationMediaDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const resolved = this.resolveUrlOrFile(dto, file, 'meditation');
    return this.mediaService.setMeditationVideo(user.userId, {
      url: resolved.url,
      sourceType: resolved.sourceType,
      title: dto.title,
      originalFileName: file?.originalname ?? null,
      mimeType: file?.mimetype ?? null,
      sizeBytes: file?.size ?? null,
    });
  }

  @Delete('image')
  clearImage() {
    return this.mediaService.clearMeditationImage();
  }

  @Delete('video')
  clearVideo() {
    return this.mediaService.clearMeditationVideo();
  }

  private resolveUrlOrFile(
    dto: SetMeditationMediaDto,
    file: Express.Multer.File | undefined,
    subdir: string,
  ) {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:8080');
    if (file) {
      return {
        url: publicUploadUrl(appUrl, subdir, file.filename),
        sourceType: SourceType.FILE,
      };
    }
    const url = dto.url?.trim();
    if (!url) {
      throw new BadRequestException('Provide url or upload a file');
    }
    return { url, sourceType: SourceType.URL };
  }
}
