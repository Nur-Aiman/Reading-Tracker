import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import CircularProgressBar from '../components/CircularProgressBar';
import { HOST } from '../api';
import Navbar from '../components/Navbar';


const UpdateProgress = () => {
    const { bookId } = useParams();
    const navigate = useNavigate();
    const [book, setBook] = useState(null);
    const [initialPage, setInitialPage] = useState(0);
    const [lastPage, setLastPage] = useState(0);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [editableNotes, setEditableNotes] = useState("");
    const [searchTerm, setSearchTerm] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
const [searchResultsMessage, setSearchResultsMessage] = useState('');




    useEffect(() => {
        fetchBook();
    }, [bookId]);

    useEffect(() => {
        if (book) {
            setInitialPage(book.page_read);
            setLastPage(book.page_read);
        }
    }, [book]);

    const notesTextareaRef = useRef(null); 

    const scrollToBottom = () => {
        
        const textarea = notesTextareaRef.current;
        if (textarea) {
            textarea.scrollTop = textarea.scrollHeight;
        }
    };

    const fetchBook = async () => {
        try {
            const response = await fetch(`${HOST}/book/viewBook/${bookId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setBook(data.book);
        } catch (error) {
            console.error("Error fetching book: ", error);
        }
    };

    // Client side: Update the handleSubmit function to send notes

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const progressData = {
            initialPage: initialPage,
            lastPage: parseInt(lastPage, 10) // Ensure lastPage is an integer
        };
    
        try {
            const response = await fetch(`${HOST}/book/updateProgress/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(progressData)
            });
    
            const data = await response.json();
            if (response.ok) {
                console.log('Progress update successful:', data);
                alert('Progress updated successfully');
                navigate('/');
            } else {
                console.error('Failed to update progress:', data);
                alert('Failed to update progress. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please try again.');
        }
    };
    
    

    

    const handleCloseBook = () => {
        fetch(`${HOST}/book/closeBook/${bookId}`, { 
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Book status updated:', data);
            alert('Book status changed to To Be Read');
            navigate('/'); 
        })
        .catch(error => {
            console.error('Error closing the book:', error);
            alert('Failed to change the book status.');
        });
    };

    const handleIncreasePage = () => {
        setLastPage((prevLastPage) => {
            if (prevLastPage < book.total_page) {
                const newLastPage = prevLastPage + 1;
                console.log(`Data type of initialPage: ${typeof initialPage}`);
                console.log(`Data type of newLastPage: ${typeof newLastPage}`);
                return newLastPage;
            }
            console.log(`Initial Page: ${initialPage}, Last Page: ${prevLastPage}`);
            console.log(`Data type of initialPage: ${typeof initialPage}`);
            console.log(`Data type of prevLastPage: ${typeof prevLastPage}`);
            return prevLastPage;
        });
    };
    
    
      
    
    const handleDecreasePage = () => {
        setLastPage((prevLastPage) => {
            const newLastPage = Math.max(initialPage, prevLastPage - 1);
            setBook((prevBook) => ({ ...prevBook, page_read: newLastPage })); // Update the book state
            console.log(`Initial Page: ${initialPage}, Last Page: ${newLastPage}`);
            return newLastPage;
        });
    };

    const toggleNotesModal = () => {
        setShowNotesModal(!showNotesModal);
        if (!showNotesModal) {
            setEditableNotes(book ? book.notes : ""); // Ensure book is not null
        }
    };

    const saveNotes = async () => {
        try {
            const response = await fetch(`${HOST}/book/updateNotes/${bookId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notes: editableNotes })
            });
            const data = await response.json();
            if (response.ok) {
                console.log('Notes updated:', data);
                alert('Notes updated successfully');
                setShowNotesModal(false);
                setBook((prevBook) => ({ ...prevBook, notes: editableNotes }));
            } else {
                console.error('Failed to update notes:', data);
                alert('Failed to update notes. Please try again.');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error. Please try again.');
        }
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
    
        // After finding matches in searchNotes
setSearchResults(matches);
setCurrentSearchIndex(matches.length > 0 ? 0 : -1);
updateSearchResultsMessage(0, matches.length); // Initial call with the first index



    
        if (matches.length > 0) {
            scrollToSearchResult(matches[0]);
        }
    };

    const updateSearchResultsMessage = (currentIndex, totalResults) => {
        if (totalResults > 0) {
            // Adjust for human-readable index (starting at 1 instead of 0)
            setSearchResultsMessage(`${currentIndex + 1} of ${totalResults} results found`);
        } else {
            setSearchResultsMessage('0 results found');
        }
    };
    
    
    const scrollToSearchResult = (index) => {
        const textarea = notesTextareaRef.current;
        if (!textarea || index === undefined) return;
    
        textarea.focus();
    
        const endIndex = index + searchTerm.length;
        textarea.setSelectionRange(index, endIndex);
    
        const linesUpToIndex = editableNotes.substring(0, index).split("\n");
        const characterCount = linesUpToIndex.reduce((acc, line) => acc + line.length + 1, 0); // +1 for newline characters
        const averageCharWidth = textarea.scrollWidth / textarea.value.length;
        const scrollRatio = characterCount * averageCharWidth / textarea.scrollWidth;
    
        textarea.scrollTop = scrollRatio * textarea.scrollHeight - textarea.clientHeight / 4;
    };
    
    
    
    
    
    
    
    useEffect(() => {
        if (searchResults.length > 0 && currentSearchIndex >= 0) {
            scrollToSearchResult(searchResults[currentSearchIndex]);
        }
    }, [searchResults, currentSearchIndex]);
    
    
    const handleNextSearchResult = () => {
        setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
    };
    
    const handlePrevSearchResult = () => {
        setCurrentSearchIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    };

    // Adjusted from previous examples

    const handleNextPrevSearchResult = (direction) => {
        setCurrentSearchIndex(prevIndex => {
            const newIndex = direction === 'next'
                ? (prevIndex + 1) % searchResults.length
                : (prevIndex - 1 + searchResults.length) % searchResults.length;
            
            // Call scrollToSearchResult directly with the newIndex's position to ensure synchronization
            scrollToSearchResult(searchResults[newIndex]);
            // Update the message with the new index position
            updateSearchResultsMessage(newIndex, searchResults.length);
    
            return newIndex;
        });
    };
    

    
    
    
    
    
    

    if (!book) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto p-4 bg-white shadow-lg rounded-lg" style={{ backgroundColor: '#F3F8FF' }}>
             <Navbar />
            <div className="text-center my-6">
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#7E30E1' }}>Update Progress</h1>
            </div>

            <div className="p-4 rounded-lg shadow-sm mb-6" style={{ borderColor: '#49108B', borderWidth: '1px' }}>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#7E30E1' }}>{book.title}</h2>
                <p className="mb-2" style={{ color: '#49108B' }}><strong>Author:</strong> {book.author}</p>
                <p className="mb-2" style={{ color: '#49108B' }}><strong>Total Pages:</strong> {book.total_page}</p>
                <div className="mb-4" style={{ color: '#49108B' }}>
  <strong style={{ marginRight: '8px', fontSize: '1rem' }}>Pages Read:</strong>
  <button
    onClick={handleDecreasePage}
    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
    style={{ margin: '0 12px' }} // Increased space around the button
  >
    -
  </button>
  <span className="text-lg font-medium" style={{ margin: '0 12px' }}>{lastPage}</span> 
  <button
    onClick={handleIncreasePage}
    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    style={{ margin: '0 12px' }} // Increased space around the button
  >
    +
  </button>
</div>


                <div className="flex items-center justify-between my-4">
    <div>
        <button
            onClick={toggleNotesModal}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded transition duration-300"
        >
            View Notes
        </button>
    </div>
    <div className="flex-1 flex justify-end">
        <CircularProgressBar percentage={book.percentage_completed || 0} />
    </div>
</div>



             

            

                <div className="flex justify-between">
                    <button type="button" onClick={handleCloseBook} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded" style={{ backgroundColor: '#E26EE5', borderColor: '#49108B' }}>
                        Close Book
                    </button>
                    <button type="submit" onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}>
                        Confirm Update
                    </button>
                </div>
            </div>

         
      
          {/* Notes Modal */}
          {/* Notes Modal */}
{showNotesModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto h-full w-full" id="my-modal">
    <div className="relative m-auto p-5 border w-11/12 max-w-4xl h-full shadow-lg rounded-md bg-white flex flex-col">
      <div className="flex-1 overflow-auto p-2">
        <h3 className="text-lg leading-6 font-medium text-gray-900 text-center mb-2">Notes - {book.title}</h3>
        {/* Before the textarea for notes */}
        <div className="flex space-x-2 mb-2 items-center">
          <input
            type="text"
            className="border flex-grow"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            onClick={() => searchNotes()}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded"
          >
            Search
          </button>
        </div>
        {/* Display search results message */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm">{searchResultsMessage}</p>
          <div className="flex space-x-2">
            <button onClick={() => handleNextPrevSearchResult('prev')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 rounded">
              Back
            </button>
            <button onClick={() => handleNextPrevSearchResult('next')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold px-4 rounded">
              Next
            </button>
          </div>
        </div>
        <textarea
          ref={notesTextareaRef}
          className="w-full p-2 border rounded"
          style={{ minHeight: '84%', borderColor: '#49108B', color: 'black' }}
          value={editableNotes}
          onChange={(e) => setEditableNotes(e.target.value)}
        />
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={scrollToBottom} className="bg-blue-500 hover:bg-blue-700 text-white font-bold px-4 rounded transition duration-300 mr-2">Scroll Bottom</button>
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

export default UpdateProgress;
