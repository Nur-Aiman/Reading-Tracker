import React, { useState, useEffect } from 'react';
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


    useEffect(() => {
        fetchBook();
    }, [bookId]);

    useEffect(() => {
        if (book) {
            setInitialPage(book.page_read);
            setLastPage(book.page_read);
        }
    }, [book]);

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

    // Prepare the data to be sent to the backend
    const progressData = {
        initialPage: initialPage,
        lastPage: lastPage,
        notes: editableNotes // Include the notes state variable
    };

    try {
        // Send a PUT request to the updateProgress endpoint
        const response = await fetch(`${HOST}/book/updateProgress/${bookId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(progressData)
        });

        const data = await response.json();

        if (response.ok) {
            // If the request was successful, show a confirmation message
            console.log('Update successful:', data);
            alert('Progress and notes updated successfully');
            navigate('/'); // Navigate back to the book list after updating
        } else {
            // If the request failed, show an error message
            console.error('Update failed:', data);
            alert('Failed to update progress and notes. Please try again.');
        }
    } catch (error) {
        // Catch any network errors and log them
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
                console.log(`Initial Page: ${initialPage}, Last Page: ${newLastPage}`);
                return newLastPage;
            }
            console.log(`Initial Page: ${initialPage}, Last Page: ${prevLastPage}`); // Log even when not increasing
            return prevLastPage; // If lastPage equals total pages, don't increase it further
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

    const saveNotes = () => {
        // When saving, update the book state with the new notes
        setBook((prevBook) => ({ ...prevBook, notes: editableNotes }));
        setShowNotesModal(false); // Close the modal
        // Now when handleSubmit is called, it will use the updated book state
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
          {showNotesModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto h-full w-full" id="my-modal">
              <div className="relative m-auto p-5 border w-11/12 max-w-4xl h-5/6 shadow-lg rounded-md bg-white" style={{ backgroundColor: '#F3F8FF', borderColor: '#49108B' }}>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Notes - {book.title}</h3>
                <textarea
                  className="mt-2 w-full flex-1 p-2 border rounded resize-none"
                  style={{ minHeight: '80%', borderColor: '#49108B', color: '#49108B' }}
                  value={editableNotes}
                  onChange={(e) => setEditableNotes(e.target.value)}
                />
                <div className="flex justify-end items-center pt-4">
                  <button
                    onClick={() => setShowNotesModal(false)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 mr-2"
                    style={{ backgroundColor: '#E26EE5' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                    style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}
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

export default UpdateProgress;
