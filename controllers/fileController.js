const pool = require('../config/db');
const fs = require('fs');
const searchFilesByTitle = require('../utils/search');
const loginAdmin = require('../utils/authAdmin');

const getFileById = async (req, res) => {
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
};

const uploadFile = async (req, res) => {
  const type = req.body.type ? req.body.type : 'doc';
  const title = req.body.title;
  const adminLogin = req.body.adminLogin;
  const adminPassword = req.body.adminPassword;

  try {
    const isLoggedIn = await loginAdmin(adminLogin, adminPassword);
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }


  if (!['news', 'doc', 'info'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type specified' });
  }
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing title' });
  }
  const file = fs.readFileSync(req.file.path);
  const result = await pool.query('INSERT INTO files(name, data, type, title) VALUES($1, $2, $3, $4) RETURNING *', [req.file.filename, file, type, title]);
  res.status(200).json(result.rows[0]);
};

const deleteFile = async (req, res) => {
  const fileId = req.body.fileId;
  const adminLogin = req.body.adminLogin;
  const adminPassword = req.body.adminPassword;

  try {
    const isLoggedIn = await loginAdmin(adminLogin, adminPassword);
    if (!isLoggedIn) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }

  if (!fileId || typeof fileId !== 'number') {
    return res.status(400).json({ error: 'Invalid or missing fileId' });
  }

  try {
    const fileResult = await pool.query('SELECT * FROM files WHERE id = $1', [fileId]);
    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    await pool.query('DELETE FROM files WHERE id = $1', [fileId]);
    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error("Error during file deletion:", error);
    return res.status(500).json({ error: 'INTERNAL_SERVER_ERROR' });
  }
};

const listFiles = async (req, res) => {
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
};
const listAllFiles = async (req, res) => {
  try {
    const query = 'SELECT id, title, name, type FROM files';
    const result = await pool.query(query);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error executing query', error.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const searchFiles = async (req, res) => {
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
};

module.exports = {
  getFileById,
  uploadFile,
  listFiles,
  searchFiles,
  deleteFile,
  listAllFiles
};