import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
        useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',

        host: process.env.DATABASE_HOST,

        username: process.env.DATABASE_USERNAME,

        password: process.env.DATABASE_PASSWORD,

        database: process.env.DATABASE_NAME, 

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
