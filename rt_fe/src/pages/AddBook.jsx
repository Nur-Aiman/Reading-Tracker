import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { HOST } from '../api';
import Navbar from '../components/Navbar';

const AddBook = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        total_page: ''
    });
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            const decodedToken = jwtDecode(token);
            setUserId(decodedToken.id);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            alert('User ID is not available. Please log in again.');
            return;
        }

      
        const bookData = {
            ...formData,
            status: 'To Be Read',   
            page_read: 0,           
            notes: '-',             
            user_id: userId,
        };

        try {
            const response = await fetch(`${HOST}/book/addBook`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bookData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                alert('Book added successfully!');
                console.log('Book added successfully');
     
                setFormData({ title: '', author: '', total_page: '' });
                navigate('/booklist');
            }
        } catch (error) {
            console.error('Error posting new book:', error);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 shadow-md rounded-lg" style={{ backgroundColor: '#F3F8FF' }}>
             <Navbar />
            <div className="text-center my-6">
            <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#49108B' }}>Add New Book</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-2" htmlFor="title" style={{ color: '#7E30E1', fontWeight: 'bold' }}>Book Title:</label>
                    <input className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                           style={{ borderColor: '#E26EE5', ringColor: '#E26EE5' }}
                           type="text" name="title" id="title" value={formData.title} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2" htmlFor="author" style={{ color: '#7E30E1', fontWeight: 'bold' }}>Author:</label>
                    <input className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                           style={{ borderColor: '#E26EE5', ringColor: '#E26EE5' }}
                           type="text" name="author" id="author" value={formData.author} onChange={handleChange} required />
                </div>
                <div>
                    <label className="block mb-2" htmlFor="total_page" style={{ color: '#7E30E1', fontWeight: 'bold' }}>Total Pages:</label>
                    <input className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2"
                           style={{ borderColor: '#E26EE5', ringColor: '#E26EE5' }}
                           type="number" name="total_page" id="total_page" value={formData.total_page} onChange={handleChange} required />
                </div>
                <button className="w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        type="submit" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF', fontWeight: 'bold' }}>
                        Submit
                </button>
            </form>
        </div>
    );
};

export default AddBook;
