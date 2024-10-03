import { Module } from '@nestjs/common';
import { MovideskService } from './movidesk.service';

@Module({
  providers: [MovideskService],
  exports: [MovideskService],
})
export class MovideskModule {}
