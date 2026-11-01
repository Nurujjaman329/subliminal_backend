/**
 * Seed 4 system boards for admin read testing (Step 3).
 * Usage: npm run seed:system-boards
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Board, BoardDocument } from '../modules/boards/schemas/board.schema';
import {
  BoardKind,
  OwnerType,
  SourceType,
} from '../common/constants/ownership';

const SEED = [
  {
    title: 'Board One',
    coverUrl:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    order: 0,
  },
  {
    title: 'Board Two',
    coverUrl:
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=600&q=80',
    order: 1,
  },
  {
    title: 'Board Three',
    coverUrl:
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    order: 2,
  },
  {
    title: 'Board Four',
    coverUrl:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
    order: 3,
  },
];

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  const boardModel = app.get<Model<BoardDocument>>(getModelToken(Board.name));

  for (const item of SEED) {
    const existing = await boardModel
      .findOne({ title: item.title, boardKind: BoardKind.SYSTEM })
      .exec();
    if (existing) {
      existing.coverUrl = item.coverUrl;
      existing.coverSourceType = SourceType.URL;
      existing.order = item.order;
      existing.isActive = true;
      existing.ownerType = OwnerType.ADMIN;
      existing.ownerId = null;
      await existing.save();
      // eslint-disable-next-line no-console
      console.log(`Updated: ${item.title}`);
    } else {
      await boardModel.create({
        title: item.title,
        coverUrl: item.coverUrl,
        coverSourceType: SourceType.URL,
        boardKind: BoardKind.SYSTEM,
        ownerType: OwnerType.ADMIN,
        ownerId: null,
        order: item.order,
        isActive: true,
        createdBy: null,
        updatedBy: null,
      });
      // eslint-disable-next-line no-console
      console.log(`Created: ${item.title}`);
    }
  }

  await app.close();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
