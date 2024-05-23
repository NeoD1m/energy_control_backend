const pool = require('../config/db');
const argon2 = require('argon2');

async function loginAdmin(adminLogin, adminPassword) {
    try {
      const { rows } = await pool.query('SELECT * FROM admins WHERE name = $1', [adminLogin]);
      const user = rows[0];
      if (user && await argon2.verify(user.password, adminPassword)) {
        const { password, ...userWithoutPassword } = user;
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.error(err);
      return false;
    }
}
module.exports = loginAdmin;