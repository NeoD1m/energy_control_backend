const pool = require('../config/db');
const loginAdmin = require('../utils/authAdmin');

const getLogs = async (req, res) => {
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

    try {
        const result = await pool.query('SELECT * FROM user_logs ORDER BY timestamp DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error getting logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getLogs
};