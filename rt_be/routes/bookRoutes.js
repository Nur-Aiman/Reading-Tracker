var express = require('express');
const { addBook, viewBooks, viewBook, startReading, closeBook, updateProgress, readingHistory, deleteBook, updateBook, updateNotes, thingsToLearn, viewThingsToLearn, updateLearningList, register, registerUser, loginUser } = require('../controller/bookController');
const { authenticateToken } = require('../middleware/authenticateToken');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// router.post('/registerUser', registerUser);
// router.post('/loginUser', loginUser);
router.post('/addBook', addBook); 
router.get('/viewBook/:bookId', viewBook);
router.put('/updateBook/:bookId', updateBook);
router.put('/startReading/:bookId', startReading);
router.get('/viewBooks', viewBooks);
router.put('/closeBook/:bookId', closeBook);
router.get('/learning', viewThingsToLearn);
router.put('/learning', updateLearningList); 
router.put('/updateNotes/:bookId', updateNotes);
router.get('/readingHistory', readingHistory); 
router.put('/updateProgress/:bookId', updateProgress);
router.delete('/deleteBook/:bookId', deleteBook);





module.exports = router;
