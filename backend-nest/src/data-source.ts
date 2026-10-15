import 'dotenv/config';
import { DataSource } from 'typeorm';

// Цей файл запускається CLI typeorm (міграції), а не Nest-контейнером,
// тому ConfigModule тут не працює і .env треба підвантажити вручну.
// Без цього міграції йшли б на localhost з дефолтними обліковими даними
// і падали б на хостингу, де пароль інший.
export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? '12345',
  database: process.env.DB_NAME ?? 'Swiftly',
  // Потрібно знати, звільні ми запустились із TS (ts-node, розробка)
  // чи з зібраного JS (production, де ts-node немає).
  // Раніше глоб був '**/*.entity{.ts,.js}' — він чіпляв одночасно
  // і dist/, і src/, і production-образ падав із SyntaxError.
  entities: [`${__dirname}/**/*.entity${__filename.endsWith('.ts') ? '.ts' : '.js'}`],
  migrations: [`${__dirname}/migrations/*${__filename.endsWith('.ts') ? '.ts' : '.js'}`],
  synchronize: false,
});