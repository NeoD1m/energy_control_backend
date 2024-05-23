const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', function(req, res) {
  authController.register(req, res);
});

router.post('/login', function(req, res) {
  authController.login(req, res);
});

module.exports = router;