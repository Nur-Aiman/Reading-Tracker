var express = require('express')
const connection = require('../config/database')
const { query, pool } = require('../config/database')

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const adjustedDate = new Date(date.getTime() + Math.abs(date.getTimezoneOffset() * 60000));
  return adjustedDate.toISOString().split("T")[0];
};

module.exports = {
  addBook: async function addBook(req, res) {
    const { title, author, total_page, status, page_read, notes } = req.body;

    if (!title || !author || !total_page || !status || page_read === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const maxIdRes = await pool.query('SELECT MAX(id) as maxid FROM Book');
      const maxId = maxIdRes.rows[0].maxid ? parseInt(maxIdRes.rows[0].maxid) : 0;
      const nextId = maxId + 1;

      const result = await pool.query(
        'INSERT INTO Book (id, title, author, total_page, status, page_read, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [nextId, title, author, total_page, status, page_read, notes]
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
    const { initialPage, lastPage } = req.body;
    const currentDate = new Date().toISOString().slice(0, 10);

    try {
      await pool.query('BEGIN');

      const bookIdInt = parseInt(bookId, 10);
      const lastPageInt = parseInt(lastPage, 10);

      if (isNaN(bookIdInt) || isNaN(lastPageInt)) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: "Invalid parameters." });
      }

      const bookQuery = 'SELECT title, author, total_page FROM Book WHERE id = $1';
      const bookResult = await pool.query(bookQuery, [bookIdInt]);

      if (bookResult.rows.length === 0) {
        await pool.query('ROLLBACK');
        return res.status(404).json({ message: 'Book not found' });
      }

      const { title, author, total_page } = bookResult.rows[0];

      const updateBookQuery = `
        UPDATE Book
        SET page_read = $1::integer,
            percentage_completed = ROUND((CAST($1 AS NUMERIC) / NULLIF($2, 0)) * 100, 2)
        WHERE id = $3
        RETURNING *;
      `;

      const updatedBook = await pool.query(updateBookQuery, [lastPageInt, total_page, bookIdInt]);

      const initialPageInt = parseInt(initialPage, 10);
      if (isNaN(initialPageInt)) {
        await pool.query('ROLLBACK');
        return res.status(400).json({ message: "Invalid initialPage, it must be an integer." });
      }

      if (lastPageInt >= total_page) {
        const finishBookQuery = 'UPDATE Book SET status = \'Finish\' WHERE id = $1 RETURNING *';
        await pool.query(finishBookQuery, [bookIdInt]);
      }

      const checkHistoryQuery = 'SELECT * FROM reading_history WHERE book_id = $1 AND date = $2';
      const historyResult = await pool.query(checkHistoryQuery, [bookIdInt, currentDate]);

      if (historyResult.rows.length > 0) {
        const updateHistoryQuery = `
          UPDATE reading_history
          SET end_page = $1,
              book_title = $2,
              author = $3
          WHERE book_id = $4 AND date = $5
          RETURNING *;
        `;
        await pool.query(updateHistoryQuery, [lastPageInt, title, author, bookIdInt, currentDate]);
      } else {
        const maxIdRes = await pool.query('SELECT MAX(id) as maxid FROM reading_history');
        const maxId = maxIdRes.rows[0].maxid ? parseInt(maxIdRes.rows[0].maxid) : 0;
        const nextId = maxId + 1;

        const insertHistoryQuery = `
          INSERT INTO reading_history (id, book_id, date, book_title, author, start_page, end_page)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
        `;
        await pool.query(insertHistoryQuery, [nextId, bookIdInt, currentDate, title, author, initialPageInt, lastPageInt]);
      }

      await pool.query('COMMIT');
      res.status(200).json({ message: 'Progress updated successfully', book: updatedBook.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Error updating progress:', error);
      res.status(500).json({ message: 'Failed to update progress', error: error.message });
    }
  },

  readingHistory: async function (req, res) {
    try {
      const query = `
        SELECT *
        FROM reading_history
        ORDER BY date DESC;
      `;

      const result = await pool.query(query);

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'No reading records found' });
      }

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

  updateBook: async function (req, res) {
    const { bookId } = req.params;
    const { title, author, total_pages } = req.body;

    if (!title || !author || !total_pages) {
      return res.status(400).json({ message: 'Missing required book details.' });
    }

    try {
      await pool.query('BEGIN');

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

      await pool.query('COMMIT');
      res.status(200).json({ message: 'Book updated successfully.', book: result.rows[0] });
    } catch (error) {
      await pool.query('ROLLBACK');
      res.status(500).json({ message: 'Failed to update the book.', error: error.message });
    }
  },

  updateNotes: async function (req, res) {
    const { bookId } = req.params;
    const { notes } = req.body;

    try {
      const updateResult = await pool.query(
        'UPDATE Book SET notes = $1 WHERE id = $2 RETURNING *',
        [notes, bookId]
      );

      if (updateResult.rows.length === 0) {
        return res.status(404).json({ message: 'Book not found.' });
      }

      res.json({
        message: 'Notes updated successfully.',
        book: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Error updating notes:', error);
      res.status(500).json({ message: 'Failed to update notes.' });
    }
  },

  viewThingsToLearn: async function (req, res) {
    try {
      const result = await pool.query('SELECT * FROM learning');

      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Learning item not found' });
      }

      res.status(200).json({
        message: 'Learning item retrieved successfully',
        learningItem: result.rows[0]
      });
    } catch (error) {
      console.error('Error retrieving learning item:', error);
      res.status(500).json({ message: 'Failed to retrieve learning item' });
    }
  },

  updateLearningList: async function (req, res) {
    const { learning_list } = req.body;

    if (!learning_list) {
      return res.status(400).json({ message: 'Missing required field: learning_list' });
    }

    try {
      const updateResult = await pool.query(
        'UPDATE learning SET learning_list = $1 RETURNING *',
        [learning_list]
      );

      if (updateResult.rowCount === 0) {
        const maxIdRes = await pool.query('SELECT MAX(id) as maxid FROM learning');
        const maxId = maxIdRes.rows[0].maxid ? parseInt(maxIdRes.rows[0].maxid, 10) : 0;
        const nextId = maxId + 1;

        const insertResult = await pool.query(
          'INSERT INTO learning (id, learning_list) VALUES ($1, $2) RETURNING *',
          [nextId, learning_list]
        );

        if (insertResult.rows.length === 0) {
          return res.status(404).json({ message: 'Failed to create learning item' });
        }

        return res.status(201).json({
          message: 'Learning item created successfully',
          learningItem: insertResult.rows[0]
        });
      }

      res.status(200).json({
        message: 'Learning item updated successfully',
        learningItem: updateResult.rows[0]
      });
    } catch (error) {
      console.error('Error updating/inserting learning item:', error);
      res.status500().json({ message: 'Failed to update/insert learning item' });
    }
  }
}
