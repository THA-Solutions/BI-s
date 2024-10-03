import { DataSource } from 'typeorm';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
        useFactory: async () => {
      const dataSource = new DataSource({
        type: 'mysql',

        host: process.env.DATABASE_HOST || 'localhost',

        username: process.env.DATABASE_USERNAME || 'root',

        password: process.env.DATABASE_PASSWORD || 'root',

        database: process.env.DATABASE_NAME || 'tests',

        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];
