const { Pool } = require('pg');

const pool = new Pool({
  user: 'neodim',
  host: 'db',
  database: 'ECDB',
  password: 'VerySecurePassword1234',
  port: 5432,
});

module.exports = pool;