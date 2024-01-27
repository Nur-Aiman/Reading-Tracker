import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import CircularProgressBar from '../components/CircularProgressBar';
import { HOST } from '../api';
import Navbar from '../components/Navbar';

const BookList = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState({ toBeRead: [], finished: [] });

    const navigateToAddBook = () => {
        navigate('/addbook');
    };

    // Function to fetch books
    const fetchBooks = async () => {
        try {
            const response = await fetch(`${HOST}/book/viewBooks`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Filter books based on status
            const toBeReadBooks = data.books.filter(book => book.status === 'To Be Read');
            const finishedBooks = data.books.filter(book => book.status === 'Finish');
            setBooks({ toBeRead: toBeReadBooks, finished: finishedBooks });
        } catch (error) {
            console.error("Error fetching books: ", error);
        }
    };

    // Use effect to fetch books on component mount
    useEffect(() => {
        fetchBooks();
    }, []);

 
    return (
        <div className="max-w-2xl mx-auto p-4" style={{ backgroundColor: '#F3F8FF' }}>
             <Navbar />
            <div className="text-center my-6">
                <h1 className="text-4xl font-bold mb-4" style={{ color: '#49108B' }}>My Bookshelf</h1>
                <button
                    onClick={navigateToAddBook}
                    className="font-bold py-2 px-4 rounded transition duration-300"
                    style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}
                >
                    Add New Book
                </button>
            </div>

            {/* To Be Read Section */}
            <div className="mb-8 p-4 rounded shadow" style={{ backgroundColor: '#F3F8FF' }}>
                <h2 className="text-2xl font-semibold pb-2 mb-4" style={{ borderBottom: `5px solid #7E30E1`, color: '#49108B' }}>To Be Read</h2>
                {books.toBeRead.map((book, index) => (
                    <Link to={`/book/${book.id}`} key={index} className="block p-3 rounded mb-3" style={{ backgroundColor: '#FFFFFF', boxShadow: `0 4px 8px #E26EE5` }}>
                        <h3 className="text-xl font-semibold" style={{ color: '#49108B' }}>{book.title}</h3>
                        <p style={{ color: '#7E30E1' }}>Author: {book.author}</p>
                        <p style={{ color: '#49108B' }}>Total Pages: {book.total_page}</p>
                        <p style={{ color: '#49108B' }}>Pages Read: {book.page_read}</p>
                    </Link>
                ))}
            </div>

            {/* Completed Section */}
            <div className="mb-8 p-4 rounded shadow" style={{ backgroundColor: '#F3F8FF' }}>
                <h2 className="text-2xl font-semibold pb-2 mb-4" style={{ borderBottom: `5px solid #7E30E1`, color: '#49108B' }}>Completed</h2>
                {books.finished.map((book, index) => (
                    <Link to={`/book/${book.id}`} key={index} className="block p-3 rounded mb-3" style={{ backgroundColor: '#FFFFFF', boxShadow: `0 4px 8px #E26EE5` }}>
                        <h3 className="text-xl font-semibold" style={{ color: '#49108B' }}>{book.title}</h3>
                        <p style={{ color: '#7E30E1' }}>Author: {book.author}</p>
                        <p style={{ color: '#49108B' }}>Total Pages: {book.total_page}</p>
                        <p style={{ color: '#49108B' }}>Pages Read: {book.page_read}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default BookList;
