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
}
