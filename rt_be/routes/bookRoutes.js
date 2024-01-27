var express = require('express');
const { addBook, viewBooks, viewBook, startReading, closeBook, updateProgress, readingHistory, deleteBook, updateBook, updateNotes } = require('../controller/bookController');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/addBook',addBook)
router.get('/viewBooks',viewBooks)
router.get('/viewBook/:bookId', viewBook);
router.put('/startReading/:bookId', startReading);
router.put('/closeBook/:bookId', closeBook);
router.put('/updateProgress/:bookId', updateProgress);
router.get('/readingHistory', readingHistory);
router.delete('/deleteBook/:bookId', deleteBook);
router.put('/updateBook/:bookId', updateBook);
router.put('/updateNotes/:bookId', updateNotes);



module.exports = router;
