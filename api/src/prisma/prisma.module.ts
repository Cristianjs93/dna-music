import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

// Global module: available throughout the entire application without having to import it
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}