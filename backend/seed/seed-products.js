require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const path = require('path');
const { client } = require('../src/utils/db');

require('../src/models/user');
require('../src/models/category');
require('../src/models/product');

async function run() {
  const sqlPath = path.join(__dirname, 'test-data.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await client.authenticate();
    console.log('✅ Підключено до БД');
    await client.query(sql);
    console.log('✅ Тестові дані додано (див. test-data.sql)');
    process.exit(0);
  } catch (err) {
    console.error('❌ Помилка:', err.message);
    process.exit(1);
  }
}

run();
