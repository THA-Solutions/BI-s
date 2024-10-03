import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsModule } from './tickets/tickets.module';
import { MovideskModule } from './movidesk/movidesk.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerInterceptor } from './interceptors/logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { PartnerService } from './partner/partner.service';
import { PartnerController } from './partner/partner.controller';
import { PartnerModule } from './partner/partner.module';
import { FieldsService } from './fields/fields.service';
import { FieldsModule } from './fields/fields.module';
import { FieldPartnerModule } from './field-partner/field-partner.module';

@Module({
  imports: [
    TicketsModule,
    MovideskModule,
    PartnerModule,
    FieldsModule,
    FieldPartnerModule,
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
  controllers: [AppController, PartnerController],
  providers: [AppService,{ provide: APP_INTERCEPTOR, useClass: LoggerInterceptor }],
})
export class AppModule {}