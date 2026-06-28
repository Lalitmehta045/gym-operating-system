import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { CacheTTL } from '@nestjs/cache-manager';
import { AppService } from './app.service.js';
import { Public } from './auth/decorators/public.decorator.js';
import { HttpCacheInterceptor } from './common/interceptors/http-cache.interceptor.js';

@Controller()
@UseInterceptors(HttpCacheInterceptor)
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @CacheTTL(86400) // 24 hours
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('seed-admin')
  async seedAdmin() {
    const { PrismaClient, Role } =
      await import('../generated/prisma/client.js');
    const bcrypt = await import('bcrypt');
    const prisma = new PrismaClient();

    const email = process.env.SUPERADMIN_EMAIL;
    const password = process.env.SUPERADMIN_PASSWORD;

    if (!email || !password) {
      return {
        error:
          'SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set in environment variables',
      };
    }

    const existingSuperAdmin = await prisma.user.findFirst({
      where: { email, tenantId: null, deletedAt: null },
    });

    if (existingSuperAdmin) {
      return { message: `SUPER_ADMIN already exists: ${email}` };
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const superAdmin = await prisma.user.create({
      data: {
        firstName: 'Super',
        lastName: 'Admin',
        email,
        passwordHash,
        role: Role.SUPER_ADMIN,
      },
    });

    return { message: `SUCCESS: SUPER_ADMIN created: ${superAdmin.email}` };
  }
}
