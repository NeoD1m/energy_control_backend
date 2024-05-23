const pool = require('../config/db');

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

module.exports = searchFilesByTitle;