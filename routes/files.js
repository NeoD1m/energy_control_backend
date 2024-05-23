const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router.get('/:id', function(req, res) {
  fileController.getFileById(req, res);
});

router.post('/upload', function(req, res) {
  fileController.uploadFile(req, res);
});

router.get('/', function(req, res) {
  fileController.listFiles(req, res);
});

router.post('/all', function(req, res) {
  fileController.listAllFiles(req, res);
});

router.post('/search', function(req, res) {
  fileController.searchFiles(req, res);
});

router.delete('/', function(req, res) {
  fileController.deleteFile(req, res);
});

module.exports = router;