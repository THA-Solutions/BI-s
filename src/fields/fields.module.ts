import { Module } from '@nestjs/common';
import { FieldsController } from './fields.controller';
import { FieldsService } from './fields.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService]
})
export class FieldsModule {}
