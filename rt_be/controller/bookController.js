var express = require('express')
const connection = require('../config/database')
const { query, pool } = require('../config/database')

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset()*60000));
  return adjustedDate.toISOString().split("T")[0];
};

module.exports = {

  addBook: async function addBook(req, res) {
    const { title, author, total_page, status, page_read, notes } = req.body;

  
    if (!title || !author || !total_page || !status || page_read === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
  
    try {
      const result = await pool.query(
        'INSERT INTO Book (title, author, total_page, status, page_read, notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [title, author, total_page, status, page_read, notes]
      );
  
      const newBook = result.rows[0];
      res.status(201).json({
        message: 'New book added successfully',
        book: newBook,
      });
    } catch (error) {
      console.error('Error adding new book:', error);
      res.status(500).json({ message: 'Failed to add new book' });
    }
  },

  viewBooks: async function viewBooks(req, res) {
    try {
      const result = await pool.query('SELECT * FROM Book');
      const books = result.rows;
      res.status(200).json({
        message: 'Books retrieved successfully',
        books: books
      });
    } catch (error) {
      console.error('Error retrieving books:', error);
      res.status(500).json({ message: 'Failed to retrieve books' });
    }
  },

  viewBook: async function (req, res) {
    const { bookId } = req.params;

    try {
        const result = await pool.query('SELECT * FROM Book WHERE id = $1', [bookId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.json({ book: result.rows[0] });
    } catch (error) {
        console.error('Error retrieving book:', error);
        res.status(500).json({ message: 'Failed to retrieve book' });
    }
},
startReading: async function (req, res) {
  const { bookId } = req.params;

  try {
    const updateResult = await pool.query(
      'UPDATE Book SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
      ['Current Read', bookId, 'To Be Read']
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Book not found or already in progress' });
    }

    res.json({
      message: 'Book status updated to Current Read',
      book: updateResult.rows[0]
    });
  } catch (error) {
    console.error('Error updating book status:', error);
    res.status(500).json({ message: 'Failed to update book status' });
  }
},
closeBook: async function (req, res) {
  const { bookId } = req.params;

  try {
      const updateResult = await pool.query(
          'UPDATE Book SET status = $1 WHERE id = $2 AND status = $3 RETURNING *',
          ['To Be Read', bookId, 'Current Read']
      );

      if (updateResult.rows.length === 0) {
          return res.status(404).json({ message: 'Book not found or not currently being read' });
      }

      res.json({
          message: 'Book status updated to To Be Read',
          book: updateResult.rows[0]
      });
  } catch (error) {
      console.error('Error updating book status:', error);
      res.status(500).json({ message: 'Failed to update book status' });
  }
},

updateProgress: async function (req, res) {
  const { bookId } = req.params;
  const { initialPage, lastPage, notes } = req.body;
  const currentDate = new Date().toISOString().slice(0, 10); // Format current date as YYYY-MM-DD

  try {
    await pool.query('BEGIN'); // Start a transaction

    // Retrieve the book title and author from the Book table
    const bookQuery = 'SELECT title, author, total_page FROM Book WHERE id = $1';
    const bookResult = await pool.query(bookQuery, [bookId]);

    if (bookResult.rows.length === 0) {
      throw new Error('Book not found');
    }

    const { title, author, total_page } = bookResult.rows[0];

    // Update the page_read column in the Book table
    const updateBook = `
      UPDATE Book
      SET 
        page_read = $1::integer,
        notes = $2,
        percentage_completed = ROUND((CAST($1 AS NUMERIC) / NULLIF(total_page, 0)) * 100, 2)
      WHERE id = $3::integer
      RETURNING *`;
    const updatedBook = await pool.query(updateBook, [lastPage, notes, bookId]);

    // Check if the last page equals total pages and update status to 'Finish'
    if (lastPage >= total_page) {
      const finishBookQuery = 'UPDATE Book SET status = \'Finish\' WHERE id = $1';
      await pool.query(finishBookQuery, [bookId]);
    }

    // Check if there's an entry for today already
    const checkHistory = 'SELECT * FROM reading_history WHERE book_id = $1 AND date = $2';
    const historyResult = await pool.query(checkHistory, [bookId, currentDate]);

    if (historyResult.rows.length > 0) {
      // Update existing reading_history entry for today
      const updateHistory = 'UPDATE reading_history SET end_page = $1, book_title = $2, author = $3 WHERE book_id = $4 AND date = $5 RETURNING *';
      await pool.query(updateHistory, [lastPage, title, author, bookId, currentDate]);
    } else {
      // Insert new entry into reading_history
      const insertHistory = 'INSERT INTO reading_history (book_id, date, book_title, author, start_page, end_page) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
      await pool.query(insertHistory, [bookId, currentDate, title, author, initialPage, lastPage]);
    }

    await pool.query('COMMIT'); // Commit the transaction
    res.status(200).json({ message: 'Progress updated successfully', book: updatedBook.rows[0] });
  } catch (error) {
    await pool.query('ROLLBACK'); // Rollback the transaction on error
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Failed to update progress' });
  }
},



readingHistory: async function (req, res) {
  try {
    const query = `
      SELECT id, date, book_id, book_title, author, start_page, end_page, last_content_read
      FROM reading_history
      WHERE date >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY date DESC;
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No reading records found in the last 7 days' });
    }

    // Format the readingRecords dates correctly
    const readingRecords = result.rows.map(record => ({
      ...record,
      date: formatDate(record.date)
    }));

    res.json({
      message: 'Reading records retrieved successfully',
      readingRecords: readingRecords
    });
  } catch (error) {
    console.error('Error retrieving reading history:', error);
    res.status(500).json({ message: 'Failed to retrieve reading history' });
  }
},


deleteBook: async function (req, res) {
  const { bookId } = req.params;

  try {
    const deleteResult = await pool.query(
      'DELETE FROM Book WHERE id = $1 RETURNING *', 
      [bookId]
    );

    if (deleteResult.rowCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.status(200).json({
      message: 'Book deleted successfully',
      deletedBook: deleteResult.rows[0]
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book' });
  }
},

updateBook : async function (req, res) {
  const { bookId } = req.params;
  const { title, author, total_pages } = req.body;

  // Validate the inputs as necessary
  if (!title || !author || !total_pages) {
    return res.status(400).json({ message: 'Missing required book details.' });
  }

  try {
    // Begin transaction
    await pool.query('BEGIN');

    // Update the book details in the database
    const updateQuery = `
      UPDATE book
      SET title = $1, author = $2, total_page = $3
      WHERE id = $4
      RETURNING *; 
    `;
    const result = await pool.query(updateQuery, [title, author, total_pages, bookId]);

    if (result.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Book not found.' });
    }

    // Commit the transaction
    await pool.query('COMMIT');
    res.status(200).json({ message: 'Book updated successfully.', book: result.rows[0] });
  } catch (error) {
    // If an error occurs, rollback the transaction
    await pool.query('ROLLBACK');
    res.status(500).json({ message: 'Failed to update the book.', error: error.message });
  }
},

updateNotes : async function (req, res)  {
  const { bookId } = req.params;
  const { notes } = req.body;

  try {
      // Perform the update query
      const updateResult = await pool.query(
          'UPDATE Book SET notes = $1 WHERE id = $2 RETURNING *',
          [notes, bookId]
      );

      // Check if the book was found and updated
      if (updateResult.rows.length === 0) {
          return res.status(404).json({ message: 'Book not found.' });
      }

      // Return the updated book
      res.json({
          message: 'Notes updated successfully.',
          book: updateResult.rows[0]
      });
  } catch (error) {
      console.error('Error updating notes:', error);
      res.status(500).json({ message: 'Failed to update notes.' });
  }
},




}