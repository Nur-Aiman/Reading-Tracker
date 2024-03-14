var express = require('express');
const { addBook, viewBooks, viewBook, startReading, closeBook, updateProgress, readingHistory, deleteBook, updateBook, updateNotes, thingsToLearn, viewThingsToLearn, updateLearningList, register, registerUser, loginUser } = require('../controller/bookController');
const { authenticateToken } = require('../middleware/authenticateToken');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/registerUser', registerUser);
router.post('/loginUser', loginUser);
router.post('/addBook',authenticateToken, addBook); 
router.get('/viewBook/:bookId',authenticateToken, viewBook);
router.put('/updateBook/:bookId',authenticateToken, updateBook);
router.put('/startReading/:bookId',authenticateToken, startReading);
router.get('/viewBooks',authenticateToken, viewBooks);
router.put('/closeBook/:bookId',authenticateToken, closeBook);
router.get('/learning/:userId',authenticateToken, viewThingsToLearn);
router.put('/learning/:userId',authenticateToken, updateLearningList); 
router.put('/updateNotes/:bookId',authenticateToken, updateNotes);
router.get('/readingHistory',authenticateToken, readingHistory); 
router.put('/updateProgress/:bookId',authenticateToken, updateProgress);
router.delete('/deleteBook/:bookId',authenticateToken, deleteBook);





module.exports = router;
