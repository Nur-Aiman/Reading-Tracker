import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { HOST } from '../api'

const Home = () => {
    const navigate = useNavigate();
    const [currentReadBooks, setCurrentReadBooks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]); 

    const navigateToBookList = () => {
        navigate('/booklist');
    };

    const navigateToCurrentRead = () => {
        navigate('/current-read'); // Replace with your actual route to the current read
    };

    const navigateToReadingHistory = () => {
        navigate('/reading-history'); // Replace with your actual route to the reading history
    };

    const navigateToUpdateProgress = (bookId) => {
        navigate(`/update-progress/${bookId}`); // Replace with your actual route to the update progress page
    };

    // Function to fetch books
    const fetchBooks = async () => {
        try {
            const response = await fetch(`${HOST}/book/viewBooks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Filter books based on status 'Current Read'
            const currentReadBooks = data.books.filter(book => book.status === 'Current Read');
            setCurrentReadBooks(currentReadBooks);
        } catch (error) {
            console.error("Error fetching books: ", error);
        }
    };

    const fetchReadingHistory = async () => {
        try {
            const response = await fetch(`${HOST}/book/readingHistory`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setReadingHistory(data.readingRecords); // Set the reading history data
        } catch (error) {
            console.error("Error fetching reading history: ", error);
        }
    };

    // This function generates an array of the last 7 days in descending order
    const getLast7Days = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

    // Call getLast7Days and store the result in a state
    const [last7Days, setLast7Days] = useState(getLast7Days());

    // Use effect to fetch books on component mount
    useEffect(() => {
        fetchBooks();
        fetchReadingHistory();
    }, []);

    return (
        <div className="container mx-auto p-4" style={{ backgroundColor: '#F3F8FF' }}>
        <div className="text-center my-6">
            <h1 className="text-4xl font-bold mb-4" style={{ color: '#49108B' }}>Reading Tracker</h1>
            <button
                onClick={navigateToBookList}
                className="font-bold py-2 px-4 rounded transition duration-300"
                style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}
            >
                View Book List
            </button>
        </div>

            {/* Current Read Section */}
           {/* Current Read Section */}
{/* Current Read Section */}
<div className="my-10 p-6 shadow-lg rounded-lg" style={{ backgroundColor: '#49108B' }}>

  <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: 'gold' }}>Current Read</h2>

  {currentReadBooks.length > 0 ? (
    currentReadBooks.map((book, index) => (
      <div key={index} className="mb-6 p-6 rounded-lg shadow-sm flex flex-col justify-between" style={{ 
        backgroundColor: '#F3F8FF', 
        border: '2px solid transparent',
        borderRadius: '0.5rem', 
        backgroundClip: 'padding-box', 
        backgroundImage: `linear-gradient(white, white), linear-gradient(90deg, #E26EE5, #7E30E1, #49108B, #E26EE5)` 
      }}>
        <div>
          <h3 className="text-xl font-semibold mb-1" style={{ color: '#49108B' }}>{book.title}</h3>
          <p className="text-md mb-1" style={{ color: '#49108B' }}>Author: {book.author}</p>
          <p className="text-md mb-2" style={{ color: '#49108B' }}>Pages Read: {book.page_read} / {book.total_page}</p>
          <div className="mb-4">
            <ProgressBar percentage={book.percentage_completed} />
          </div>
        </div>
        <div className="self-end">
          <button
            onClick={() => navigateToUpdateProgress(book.id)}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            style={{ backgroundColor: '#49108B', color: '#F3F8FF' }}
          >
            Update Progress
          </button>
        </div>
      </div>
    ))
  ) : (
    <p className="text-center" style={{ color: '#F3F8FF' }}>No current read books available. Start reading</p>
  )}

</div>



            {/* Reading History Section */}
            <div className="my-10">
    <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: '#49108B' }}>Reading History</h2>
    {
        last7Days.map((date, index) => {
            const todaysRecords = readingHistory.filter(record => record.date === date);
            return (
                <div key={index} className="mb-6 p-4 rounded-lg shadow"
                     style={{ backgroundColor: '#F3F8FF', borderLeft: `4px solid ${'#7E30E1'}`, boxShadow: `0 2px 5px ${'#E26EE5'}` }}>
                    <h3 className="text-xl font-semibold mb-3 p-2 rounded" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}>{date}</h3>
                    {todaysRecords.length > 0 ? (
                        todaysRecords.map((record, recordIdx) => (
                            <div key={recordIdx} className="mb-2 p-2 rounded transition duration-300"
                                 style={{ backgroundColor: '#F3F8FF', color: '#49108B' }}>
                                <p className="font-medium">Title: {record.book_title}</p>
                                <p className="text-sm">Author: {record.author}</p>
                                <p className="text-sm">Pages: {record.start_page} - {record.end_page}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-center" style={{ color: '#49108B' }}>No reading activity</p>
                    )}
                </div>
            );
        })
    }
    
</div>


            {/* ... other sections ... */}
        </div>
    );
};

export default Home;
