const pool = require('../config/db');

async function logAction(userId, action, fileId = null){
    try {
        const query = 'INSERT INTO user_logs (user_id, action, file_id) VALUES ($1, $2, $3)';
        const values = [userId, action, fileId];
        await pool.query(query, values);
        console.log('Action logged:', { userId, action, fileId });
    } catch (error) {
        console.error('Error logging action:', error);
    }
};

module.exports = logAction;