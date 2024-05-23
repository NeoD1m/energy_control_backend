const express = require('express');
const router = express.Router();
const logsController = require('../controllers/logsController');

router.post('/', function(req, res) {
    logsController.getLogs(req, res);
});

module.exports = router;