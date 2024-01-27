// BookDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HOST } from '../api';
import Navbar from '../components/Navbar';


const BookDetails = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [bookDetails, setBookDetails] = useState(null);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [totalPages, setTotalPages] = useState('');
    const [pagesRead, setPagesRead] = useState('');
    const [editableNotes, setEditableNotes] = useState("");

    const toggleEditMode = () => {
      setEditMode(!editMode);
  };

  const saveChanges = () => {
    // Validation or any other logic
    fetch(`${HOST}/book/updateBook/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        author: author,
        total_pages: totalPages
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      alert('Book updated successfully!');
      setBookDetails(data.book); // Update the book details state
      setEditMode(false); // Exit edit mode
    })
    .catch(error => {
      console.error('Error updating book:', error);
      alert('Failed to update book.');
    });
  };
  

    useEffect(() => {
        // Replace with the actual API call
        fetch(`${HOST}/book/viewBook/${bookId}`)
            .then(response => response.json())
            .then(data => setBookDetails(data.book))
            .catch(error => console.error('Error fetching book details:', error));
    }, [bookId]);

    useEffect(() => {
      if (bookDetails) {
          setTitle(bookDetails.title);
          setAuthor(bookDetails.author);
          setTotalPages(bookDetails.total_page);
          setPagesRead(bookDetails.page_read);
      }
  }, [bookDetails]);

  // Handlers for change events on inputs
  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleAuthorChange = (e) => setAuthor(e.target.value);
  const handleTotalPagesChange = (e) => setTotalPages(e.target.value);


    const handleStartReading = () => {
        fetch(`${HOST}/book/startReading/${bookId}`, { method: 'PUT' })
            .then(response => response.json())
            .then(data => {
                console.log('Book status updated:', data);
                setBookDetails(data.book); // Update the local state to reflect the change
                alert('You have started reading the book.'); // Display pop-up message
                navigate('/'); // Navigate to the Home page
            })
            .catch(error => {
                console.error('Error starting to read the book:', error);
                alert('Failed to start reading the book.'); // Display error message
            });
    };

    // Function to handle the deletion of the book
    const handleDeleteBook = () => {
      if(window.confirm("Are you sure you want to delete this book?")) {
          fetch(`${HOST}/book/deleteBook/${bookId}`, { method: 'DELETE' })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return response.json();
              })
              .then(() => {
                  alert('Book deleted successfully');
                  navigate('/booklist'); // Navigate back to the book list
              })
              .catch(error => {
                  console.error('Error deleting the book:', error);
                  alert('Failed to delete the book.');
              });
      }
  };

  const toggleNotesModal = () => {
    setShowNotesModal(!showNotesModal);
    if (!showNotesModal) {
        // When opening the modal, populate editableNotes with current notes
        setEditableNotes(bookDetails ? bookDetails.notes : "");
    }
};

const saveNotes = () => {
  fetch(`${HOST}/book/updateNotes/${bookId}`, {
      method: 'PUT',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          notes: editableNotes
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json();
  })
  .then(data => {
      alert('Notes updated successfully!');
      setShowNotesModal(false); // Close the modal after saving
      setBookDetails(data.book); // Update the book details state with the updated notes
  })
  .catch(error => {
      console.error('Error updating notes:', error);
      alert('Failed to update notes.');
  });
};


    if (!bookDetails) return <div>Loading...</div>;

    return (
      <div className="max-w-md mx-auto p-6 shadow-lg rounded-lg" style={{ backgroundColor: '#F3F8FF' }}>
         <Navbar />
          <div className="text-center my-6">
              {editMode ? (
                  <input
                      className="text-4xl font-bold mb-2 text-center"
                      style={{ color: '#49108B' }}
                      value={title}
                      onChange={handleTitleChange}
                  />
              ) : (
                  <h2 className="text-4xl font-bold mb-2" style={{ color: '#49108B' }}>{title}</h2>
              )}
          </div>
          
          {editMode ? (
              <input
                  className="text-xl mb-1"
                  style={{ color: '#49108B' }}
                  value={author}
                  onChange={handleAuthorChange}
              />
          ) : (
              <p className="text-xl mb-1" style={{ color: '#49108B' }}><strong>Author:</strong> {author}</p>
          )}

          {editMode ? (
              <input
                  type="number"
                  className="text-lg mb-1"
                  style={{ color: '#49108B' }}
                  value={totalPages}
                  onChange={handleTotalPagesChange}
              />
          ) : (
              <p className="text-lg mb-1" style={{ color: '#49108B' }}><strong>Total Pages:</strong> {totalPages}</p>
          )}

<p className="text-lg mb-1" style={{ color: '#49108B' }}><strong>Pages Read:</strong> {pagesRead}</p>

          <div className="flex justify-between my-3">
              <button 
                  className="font-bold py-2 px-4 rounded transition duration-300"
                  style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}
                  onClick={toggleNotesModal}
              >
                  View Notes
              </button>
              <button 
                  className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded transition duration-300"
                  onClick={handleStartReading}
              >
                  Start Reading
              </button>
          </div>

          <button 
              onClick={editMode ? saveChanges : toggleEditMode}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 mt-3"
          >
              {editMode ? 'Save Changes' : 'Edit Details'}
          </button>

          {/* Delete Book Button */}
          <button 
              onClick={handleDeleteBook}
              className="w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition duration-300 mt-3"
          >
              Delete Book
          </button>
          {showNotesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto h-full w-full" id="my-modal">
                <div className="relative m-auto p-5 border w-11/12 max-w-4xl h-5/6 shadow-lg rounded-md bg-white flex flex-col">
                    <div className="flex-1 overflow-auto p-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-4">Notes - {title}</h3>
                        <textarea
                            className="w-full p-2 border rounded"
                            style={{ minHeight: '80%' }}
                            value={editableNotes}
                            onChange={(e) => setEditableNotes(e.target.value)}
                        />
                    </div>
                    <div className="flex justify-end pt-4">
                        <button
                            onClick={toggleNotesModal}
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 mr-2"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={saveNotes}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        )}

          
        </div>
    );
};

export default BookDetails;
