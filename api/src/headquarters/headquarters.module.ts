import { Module } from '@nestjs/common';
import { HeadquartersController } from './headquarters.controller';
import { HeadquartersService } from './headquarters.service';

@Module({
  controllers: [HeadquartersController],
  providers: [HeadquartersService],
  exports: [HeadquartersService],
})
export class HeadquartersModule {}
