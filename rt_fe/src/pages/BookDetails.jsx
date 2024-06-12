
import React, { useState, useEffect, useRef } from 'react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
    const [searchResultsMessage, setSearchResultsMessage] = useState('');


    const toggleEditMode = () => {
      setEditMode(!editMode);
  };

  const searchNotes = () => {
    if (!searchTerm.trim()) {
        setSearchResults([]);
        setCurrentSearchIndex(-1);
        setSearchResultsMessage('0 results found');
        return;
    }

    const matches = [];
    let match;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    
    while ((match = regex.exec(editableNotes)) != null) {
        matches.push(match.index);
    }

    setSearchResults(matches);
    setCurrentSearchIndex(matches.length > 0 ? 0 : -1);
    updateSearchResultsMessage(0, matches.length);
    
    if (matches.length > 0) {
        scrollToSearchResult(matches[0]);
    }
};



const updateSearchResultsMessage = (currentIndex, totalResults) => {
    if (totalResults > 0) {

        setSearchResultsMessage(`${currentIndex + 1} of ${totalResults} results found`);
    } else {
        setSearchResultsMessage('0 results found');
    }
};

const handleNextSearchResult = () => {
    setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
};

const handlePrevSearchResult = () => {
    setCurrentSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
};

const handleNextPrevSearchResult = (direction) => {
    setCurrentSearchIndex((prevIndex) => {
        let newIndex;
        if (direction === 'next') {
            newIndex = (prevIndex + 1) % searchResults.length;
        } else {
            newIndex = (prevIndex - 1 + searchResults.length) % searchResults.length;
        }
        scrollToSearchResult(searchResults[newIndex]);
        updateSearchResultsMessage(newIndex, searchResults.length);
        return newIndex;
    });
};

const scrollToSearchResult = (index) => {
    const textarea = textareaRef.current;
    if (!textarea || index === undefined) return;
  
    textarea.focus();
    const endIndex = index + searchTerm.length;
    textarea.setSelectionRange(index, endIndex);
  
    const scrollPosition = textarea.scrollHeight * (index / editableNotes.length);
    textarea.scrollTop = scrollPosition;
  };





  const saveChanges = () => {
  
    fetch(`${HOST}/book/updateBook/${bookId}`, {
      method: 'PUT',
      credentials: 'include',
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
      setBookDetails(data.book); 
      setEditMode(false);
    })
    .catch(error => {
      console.error('Error updating book:', error);
      alert('Failed to update book.');
    });
  };

  const textareaRef = useRef(null); 

  const scrollToBottom = () => { 
      if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
      }
  };
  

    useEffect(() => {
    
        fetch(`${HOST}/book/viewBook/${bookId}`,{method: 'GET', credentials: 'include'})
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


  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleAuthorChange = (e) => setAuthor(e.target.value);
  const handleTotalPagesChange = (e) => setTotalPages(e.target.value);


    const handleStartReading = () => {
        fetch(`${HOST}/book/startReading/${bookId}`, { method: 'PUT', credentials:'include' })
            .then(response => response.json())
            .then(data => {
                console.log('Book status updated:', data);
                setBookDetails(data.book); 
                alert('You have started reading the book.'); 
                navigate('/'); 
            })
            .catch(error => {
                console.error('Error starting to read the book:', error);
                alert('Failed to start reading the book.'); 
            });
    };

   
    const handleDeleteBook = () => {
      if(window.confirm("Are you sure you want to delete this book?")) {
          fetch(`${HOST}/book/deleteBook/${bookId}`, { method: 'DELETE', credentials:'include' })
              .then(response => {
                  if (!response.ok) {
                      throw new Error('Network response was not ok');
                  }
                  return response.json();
              })
              .then(() => {
                  alert('Book deleted successfully');
                  navigate('/booklist');
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
     
        setEditableNotes(bookDetails ? bookDetails.notes : "");
    }
};

const saveNotes = () => {
  fetch(`${HOST}/book/updateNotes/${bookId}`, {
      method: 'PUT',
      credentials: 'include',
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
      setShowNotesModal(false); 
      setBookDetails(data.book); 
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

       
          <button 
              onClick={handleDeleteBook}
              className="w-full bg-red-600 hover:bg-red-800 text-white font-bold py-2 px-4 rounded transition duration-300 mt-3"
          >
              Delete Book
          </button>
          {showNotesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto h-full w-full" id="my-modal">
    <div className="relative m-auto p-5 border w-11/12 max-w-4xl h-full shadow-lg rounded-md bg-white flex flex-col">
      <div className="flex-1 overflow-auto p-2">
        <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-2">Notes - {title}</h3>
        
        <div className="flex space-x-2 mb-2 items-center">
          <input
            type="text"
            className="border flex-grow"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={searchNotes}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
          >
            Search
          </button>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm">{searchResultsMessage}</p>
          <div className="flex space-x-2">
            <button  onClick={() => handleNextPrevSearchResult('prev')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 rounded">
              Previous
            </button>
            <button onClick={() => handleNextPrevSearchResult('next')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 rounded">
              Next
            </button>
          </div>
        </div>
        
        <textarea
          ref={textareaRef}
          className="w-full p-2 border rounded"
          style={{ minHeight: '84%', borderColor: '#49108B', color: 'black' }}
          value={editableNotes}
          onChange={(e) => setEditableNotes(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end pt-4">
        <button onClick={scrollToBottom} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded transition duration-300 mr-2">
          Scroll Bottom
        </button>
        <button onClick={() => setShowNotesModal(false)} className="bg-red-500 hover:bg-red-700 text-white font-bold px-4 rounded transition duration-300 mr-2">
          Cancel
        </button>
        <button onClick={saveNotes} className="bg-green-500 hover:bg-green-700 text-white font-bold px-4 rounded transition duration-300">
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
