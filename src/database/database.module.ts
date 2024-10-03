import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Fields } from './entities/fields.entity';
import { Partner } from './entities/partner.entity';
import { databaseProviders } from './database.providers';

@Module({
  imports: [
    TypeOrmModule.forFeature([Partner,Fields]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST.toString() || 'localhost',
      port: 3306,
      username: process.env.DATABASE_USERNAME.toString() || 'root',
      password: process.env.DATABASE_PASSWORD.toString()  || 'root',
      database: process.env.DATABASE_NAME.toString() || 'tests',
      entities: [Partner, Fields],
      synchronize: true,
    })
  ],
  providers: [DatabaseService,{ provide: IDataServices, useClass: DatabaseService }, ...databaseProviders],
  exports: [IDataServices, ...databaseProviders]
})
export class DatabaseModule {}
