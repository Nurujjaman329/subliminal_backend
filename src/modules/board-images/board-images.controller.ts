import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BoardImagesService } from './board-images.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateBoardImageDto } from './dto/create-board-image.dto';

@Controller()
@UseGuards(JwtAuthGuard)
export class BoardImagesController {
  constructor(private readonly boardImagesService: BoardImagesService) {}

  @Get('boards/:boardId/images')
  list(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
  ) {
    return this.boardImagesService.listForBoard(user.userId, boardId);
  }

  @Post('boards/:boardId/images')
  add(
    @CurrentUser() user: { userId: string },
    @Param('boardId') boardId: string,
    @Body() dto: CreateBoardImageDto,
  ) {
    return this.boardImagesService.addUserImage(user.userId, boardId, dto);
  }

  @Delete('board-images/:id')
  remove(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.boardImagesService.deleteUserImage(user.userId, id);
  }
}
