const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { Pool } = require('pg');
const argon2 = require('argon2');

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const pool = new Pool({
  user: 'neodim',
  host: 'db',
  database: 'ECDB',
  password: 'VerySecurePassword1234',
  port: 5432,
});

app.get('/test', async (req, res) => {
  res.status(200).send('ok');
});

app.get('/file/:id', async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
  if (result.rows.length > 0) {
    const pdf = result.rows[0];
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=${pdf.name}`);
    res.send(pdf.data);
  } else {
    res.status(404).json({ message: "File not found" });
  }
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;

  try {
    const userExists = await pool.query(
      'SELECT * FROM users WHERE name = $1',
      [name]
    );
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
});

app.post('/login', async (req, res) => {
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
});

app.post('/favourites/add', async (req, res) => {
  const { userId, fileId } = req.body;
  try {
    const favourite = await addFavouritePDF(userId, fileId);
    res.json(favourite);
  } catch (error) {
    res.status(500).send('Error adding to favourites');
  }
});

app.delete('/favorites/:userId/:fileId', async (req, res) => {
  const { userId, fileId } = req.params;

  try {
    const deleteQuery = `
      DELETE FROM user_favourites
      WHERE user_id = $1 AND file_id = $2
    `;
    const result = await pool.query(deleteQuery, [userId, fileId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'File not found in favorites' });
    }

    res.status(200).json({ message: 'File removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing file from favorites', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/favourites/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const query = `
      SELECT f.id, f.title, true AS is_favourite FROM files f
      INNER JOIN user_favourites uf ON f.id = uf.file_id
      WHERE uf.user_id = $1
    `;
    const { rows } = await pool.query(query, [userId]);
    const modifiedRows = rows.map(row => ({
      ...row,
      is_favourite: row.is_favourite === true,
    }));
    res.json(modifiedRows);
  } catch (error) {
    console.error('Error fetching favourite files', error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  const type = req.body.type ? req.body.type : 'doc';
  const title = req.body.title;
  console.log(title);
  if (!['news', 'doc', 'info'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type specified' });
  }
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing title' });
  }
  const file = fs.readFileSync(req.file.path);
  const result = await pool.query('INSERT INTO files(name, data, type, title) VALUES($1, $2, $3, $4) RETURNING *', [req.file.filename, file, type, title]);
  res.status(200).json(result.rows[0]);
});

app.get('/files', async (req, res) => {
  try {
    const { type, userId } = req.query;
    if (!type) {
      return res.status(400).json({ error: 'File type is required' });
    }
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const query = {
      text: `
        SELECT f.id, f.title, 
               CASE WHEN uf.file_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite
        FROM files f
        LEFT JOIN user_favourites uf ON f.id = uf.file_id AND uf.user_id = $2
        WHERE f.type = $1
      `,
      values: [type, userId],
    };
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/search', async (req, res) => {
  try {
    const { searchQuery, userId } = req.body;
    if (!searchQuery) {
      return res.status(400).send({ error: 'searchQuery is required' });
    }
    if (!userId) {
      return res.status(400).send({ error: 'User ID is required' });
    }
    const files = await searchFilesByTitle(searchQuery, userId);
    res.json(files);
  } catch (error) {
    console.error('Error searching for files', error);
    res.status(500).send({ error: 'Internal server error' });
  }
});
async function addFavouritePDF(userId, pdfId) {
  try {
    const result = await pool.query(
      'INSERT INTO user_favourites (user_id, file_id) VALUES ($1, $2) RETURNING *;',
      [userId, pdfId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding favourite PDF', error);
    throw error;
  }
}

async function searchFilesByTitle(searchQuery, userId) {
  const query = {
    text: `
      SELECT f.id, f.title, 
             CASE WHEN uf.file_id IS NOT NULL THEN TRUE ELSE FALSE END AS is_favourite
      FROM files f
      LEFT JOIN user_favourites uf ON f.id = uf.file_id AND uf.user_id = $2
      WHERE f.title ILIKE $1
    `,
    values: [`%${searchQuery}%`, userId],
  };
  const { rows } = await pool.query(query);
  return rows;
}