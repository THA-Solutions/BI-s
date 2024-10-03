import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IDataServices } from 'src/core/abstract/data-service.abstract';
import { Fields } from './entities/fields.entity';
import { Partner } from './entities/partner.entity';
import { databaseProviders } from './database.providers';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([Partner,Fields]),
    TypeOrmModule.forRoot({
      
      retryDelay: 3000,
      
      type: 'mysql',
      host: process.env.DATABASE_HOST,
      port: 3306,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      synchronize: true,
      
    }),
  ],
  providers: [{provide : IDataServices, useClass: DatabaseService},{ provide: IDataServices, useClass: DatabaseService }, ...databaseProviders],
  exports: [IDataServices, ...databaseProviders]
})
export class DatabaseModule {
}

