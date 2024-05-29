const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const { upload, processImage } = require('../middleware/multer-config');
const booksCtrl = require('../controllers/books');

router.post('/:id/rating', auth, booksCtrl.giveRating);
router.get('/bestrating', booksCtrl.getThreeBestBooks);
router.post('/', auth, upload, processImage, booksCtrl.createBook);
router.put('/:id', auth, upload, processImage, booksCtrl.modifyBook);
router.delete('/:id', auth, booksCtrl.deleteBook);
router.get('/:id', booksCtrl.getOneBook);
router.get('/', booksCtrl.getAllBooks);


module.exports = router;