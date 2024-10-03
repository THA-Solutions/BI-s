import { Module } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { DatabaseModule } from 'src/database/database.module';
import { FieldsModule } from 'src/fields/fields.module';
import { FieldPartnerModule } from 'src/field-partner/field-partner.module';

@Module({    
    imports: [DatabaseModule, FieldsModule,FieldPartnerModule],
    providers: [PartnerService],
    exports: [PartnerService],
    controllers: [PartnerController]
})
export class PartnerModule {

}
