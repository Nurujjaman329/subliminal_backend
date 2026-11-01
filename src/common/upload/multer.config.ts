import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

export function ensureUploadSubdir(subdir: string) {
  const root = process.env.UPLOAD_DIR || 'uploads';
  const path = join(process.cwd(), root, subdir);
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
  return path;
}

export function diskUpload(subdir: string, maxBytes = 25 * 1024 * 1024) {
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => {
        cb(null, ensureUploadSubdir(subdir));
      },
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname) || '.bin';
        cb(null, `${randomUUID()}${ext}`);
      },
    }),
    limits: {
      fileSize: maxBytes,
    },
  };
}

export function publicUploadUrl(
  appUrl: string,
  subdir: string,
  filename: string,
) {
  const base = appUrl.replace(/\/$/, '');
  return `${base}/uploads/${subdir}/${filename}`;
}
