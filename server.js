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
  database: 'pdfs',
  password: 'VerySecurePassword1234',
  port: 5432,
});

app.post('/upload', upload.single('file'), async (req, res) => {
  console.log('Starting upload - ', req.file.filename);
  const file = fs.readFileSync(req.file.path);
  const result = await pool.query('INSERT INTO pdf_files(name, data) VALUES($1, $2) RETURNING *', [req.file.filename, file]);
  res.status(200).json(result.rows[0]);
  console.log('Ended upload - ', req.file.filename);
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
      res.status(404).json({message: "File not found"});
  }
});

app.post('/register', async (req, res) => {
  const { name, password } = req.body;
  try {
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
      res.status(200).send('Login successful');
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.post('/favourites/add', async (req, res) => {
  const { userId, pdfId } = req.body;
  try {
    const favourite = await addFavouritePDF(userId, pdfId);
    res.json(favourite);
  } catch (error) {
    res.status(500).send('Error adding to favourites');
  }
});

app.delete('/favourites/remove', async (req, res) => {
  const { userId, pdfId } = req.body;
  try {
    const favourite = await removeFavouritePDF(userId, pdfId);
    res.json(favourite);
  } catch (error) {
    res.status(500).send('Error = 3000;')}});

app.get('/favourites/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);
  if (!userId) {
    return res.status(400).send('Invalid user ID');
  }
  
  try {
    const pdfIds = await getFavouritePDFs(userId);
    res.json({ userId, pdfIds });
  } catch (error) {
    res.status(500).send('Error retrieving favourite PDFs');
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
async function removeFavouritePDF(userId, pdfId) {
  try {
    const result = await pool.query(
      'DELETE FROM user_favourites WHERE user_id = $1 AND file_id = $2 RETURNING *;',
      [userId, pdfId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error removing favourite PDF', error);
    throw error;
  }
}
async function getFavouritePDFs(userId) {
  try {
    const result = await pool.query(
      'SELECT file_id FROM user_favourites WHERE user_id = $1;',
      [userId]
    );
    const pdfIds = result.rows.map(row => row.pdf_id);
    return pdfIds;
  } catch (error) {
    console.error('Error retrieving favourite PDFs', error);
    throw error;
  }
}