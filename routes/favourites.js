const express = require('express');
const router = express.Router();
const favouriteController = require('../controllers/favouriteController');

router.post('/add', function(req, res) {
  favouriteController.addFavourite(req, res);
});

router.delete('/:userId/:fileId', function(req, res) {
  favouriteController.removeFavourite(req, res);
});

router.get('/:userId', function(req, res) {
  favouriteController.listFavourites(req, res);
});

module.exports = router;