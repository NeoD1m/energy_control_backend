
async function addFavouritePDF(userId, pdfId) {
    try {
      const result = await pool.query(
        'INSERT INTO user_favourite_pdfs (user_id, pdf_id) VALUES ($1, $2) RETURNING *;',
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
        'DELETE FROM user_favourite_pdfs WHERE user_id = $1 AND pdf_id = $2 RETURNING *;',
        [userId, pdfId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error removing favourite PDF', error);
      throw error;
    }
  }