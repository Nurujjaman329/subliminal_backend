/**
 * Seed one local admin user for Step 1 foundation.
 * Usage: npm run seed:admin
 */
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../app.module';
import { UsersService } from '../modules/users/users.service';
import { UserRole, UserStatus } from '../common/constants/roles';

async function seedAdmin() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const users = app.get(UsersService);
  const config = app.get(ConfigService);

  const email = (
    config.get<string>('SEED_ADMIN_EMAIL') ?? 'admin@subliminal.local'
  )
    .toLowerCase()
    .trim();
  const password =
    config.get<string>('SEED_ADMIN_PASSWORD') ?? 'admin123';
  const name = config.get<string>('SEED_ADMIN_NAME') ?? 'Demo Admin';

  const existing = await users.findByEmail(email);
  if (existing) {
    existing.role = UserRole.ADMIN;
    existing.status = UserStatus.ACTIVE;
    existing.passwordHash = await bcrypt.hash(password, 10);
    existing.name = name;
    existing.emailVerified = true;
    existing.emailVerifiedAt = new Date();
    await existing.save();
    // eslint-disable-next-line no-console
    console.log(`Admin updated: ${email}`);
  } else {
    await users.create({
      email,
      name,
      passwordHash: await bcrypt.hash(password, 10),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      authProviders: [
        {
          provider: 'password',
          providerUserId: email,
          email,
          linkedAt: new Date(),
        },
      ],
    });
    // eslint-disable-next-line no-console
    console.log(`Admin created: ${email}`);
  }

  // eslint-disable-next-line no-console
  console.log(`Password: ${password}`);
  await app.close();
}

seedAdmin().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
