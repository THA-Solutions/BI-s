import { Module } from '@nestjs/common';
import { FieldPartnerService } from './field-partner.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [FieldPartnerService],
  exports: [FieldPartnerService],
})
export class FieldPartnerModule {}
