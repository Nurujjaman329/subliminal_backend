import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BoardImage, BoardImageSchema } from './schemas/board-image.schema';
import { BoardImagesService } from './board-images.service';
import { BoardImagesController } from './board-images.controller';
import { BoardsModule } from '../boards/boards.module';

@Module({
  imports: [
    BoardsModule,
    MongooseModule.forFeature([{ name: BoardImage.name, schema: BoardImageSchema }]),
  ],
  controllers: [BoardImagesController],
  providers: [BoardImagesService],
  exports: [BoardImagesService, MongooseModule],
})
export class BoardImagesModule {}
