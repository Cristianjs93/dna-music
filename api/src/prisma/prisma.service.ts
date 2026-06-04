import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // connects to data base when the module is initialized
  async onModuleInit() {
    await this.$connect();
  }

  // closes the connection cleanly when the module is destroyed
  async onModuleDestroy() {
    await this.$disconnect();
  }
}