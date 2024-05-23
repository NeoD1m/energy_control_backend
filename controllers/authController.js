const pool = require('../config/db');
const argon2 = require('argon2');

const register = async (req, res) => {
  const { name, password } = req.body;
  try {
    const userExists = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
    if (userExists.rows.length > 0) {
      return res.status(409).send('Username already exists');
    }
    const hash = await argon2.hash(password);
    const result = await pool.query(
      'INSERT INTO users (name, password) VALUES ($1, $2) RETURNING *',
      [name, hash]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = register;

const login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const { rows } = await pool.query('SELECT * FROM users WHERE name = $1', [name]);
    const user = rows[0];
    if (user && await argon2.verify(user.password, password)) {
      const { password, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

module.exports = {
  login,
  register
};