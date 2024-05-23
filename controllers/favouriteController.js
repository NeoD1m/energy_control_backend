const pool = require('../config/db');
const logAction = require('../utils/logAction');

const addFavourite = async (req, res) => {
  const { userId, fileId } = req.body;
  try {
    const favourite = await addFavouritePDF(userId, fileId);
    await logAction(userId,"Файл добавлен в избранное",fileId);
    res.json(favourite);
  } catch (error) {
    res.status(500).send('Error adding to favourites');
  }
};

const removeFavourite = async (req, res) => {
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
    await logAction(userId,action="Файл удален из избранного",fileId);
    res.status(200).json({ message: 'File removed from favorites successfully' });
  } catch (error) {
    console.error('Error removing file from favorites', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const listFavourites = async (req, res) => {
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
};

async function addFavouritePDF(userId, pdfId) {
  try {
    const result = await pool.query(
      'INSERT INTO user_favourites (user_id, file_id) VALUES($1, $2) RETURNING *;',
      [userId, pdfId]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error adding favourite PDF', error);
    throw error;
  }
}

module.exports = {
    listFavourites,
    addFavourite,
    removeFavourite,
};