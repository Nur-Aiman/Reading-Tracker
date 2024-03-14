import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../components/ProgressBar';
import { HOST } from '../api'
import LoginModal from '../components/LoginModal';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode'; 


const Home = () => {
    const navigate = useNavigate();
    const [currentReadBooks, setCurrentReadBooks] = useState([]);
    const [readingHistory, setReadingHistory] = useState([]); 
    const [isModalOpen, setIsModalOpen] = useState(false); 
    const [editorContent, setEditorContent] = useState("");
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!Cookies.get('token'));
    const [userEmail, setUserEmail] = useState('');
    const [userId, setUserId] = useState(null);
    const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
          const decodedToken = jwtDecode(token);
          setUserEmail(decodedToken.email);
          setUserId(decodedToken.id);
        } else {
          setUserEmail('');
          setUserId(null);
        }
      }, [isLoggedIn]);

    

      useEffect(() => {
        if (userId) {
            console.log('User ID is set:', userId);
        fetchBooks();
        fetchReadingHistory();
        }
    }, [isLoggedIn, isLoginModalOpen, userId]);
    

    const toggleLoginModal = () => {
        setIsLoginModalOpen(!isLoginModalOpen);
    };

    const handleSuccessfulLogin = () => {
        setIsLoggedIn(true);

    };

    const handleLogoff = () => {
   
        const isConfirmed = window.confirm("Are you sure you want to log off?");
    

        if (isConfirmed) {
            Cookies.remove('token');
            setIsLoggedIn(false);
            fetchBooks();
            fetchReadingHistory();
            window.location.reload();
        }
    
    };
    

    const navigateToBookList = () => {
        navigate('/booklist');
    };

    const navigateToCurrentRead = () => {
        navigate('/current-read'); 
    };

    const navigateToReadingHistory = () => {
        navigate('/reading-history');
    };

    const navigateToUpdateProgress = (bookId) => {
        navigate(`/update-progress/${bookId}`);
    };

    const toggleModal = () => {
        if (!isModalOpen) {
            fetchLearningList();
        }
        setIsModalOpen(!isModalOpen);
    };
    

    const fetchBooks = async () => {
        console.log(userId)
        if (!userId) return; 
        try {
            const response = await fetch(`${HOST}/book/viewBooks?userId=${userId}`, {
                method: 'GET',
                credentials: 'include', 
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCurrentReadBooks(data.books.filter(book => book.status === 'Current Read'));
        } catch (error) {
            console.error("Error fetching books: ", error);
        }
    };
    

    const fetchReadingHistory = async () => {
        console.log(userId)
        if (!userId) return;
        try {
            const response = await fetch(`${HOST}/book/readingHistory?userId=${userId}`, {
                method: 'GET',
                credentials: 'include',
            }); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setReadingHistory(data.readingRecords);
        } catch (error) {
            console.error("Error fetching reading history: ", error);
        }
    };

  
    const fetchLearningList = async () => {
        if (!userId) return; 
        try {
            const response = await fetch(`${HOST}/book/learning/${userId}`, {
                method: 'GET',
                credentials: 'include',
            }); 
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setEditorContent(data.learningItem.learning_list);
        } catch (error) {
            console.error("Error fetching learning list: ", error);
        }
    };


    const handleSaveContent = async () => {
        if (!userId) {
            alert("User ID is not available. Please log in again.");
            return;
        }
    
        try {
            const response = await fetch(`${HOST}/book/learning/${userId}`, { 
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ learning_list: editorContent }), 
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const data = await response.json();
            console.log('Save successful:', data);
            alert('Learning list updated successfully.'); 
        } catch (error) {
            console.error("Error saving learning list: ", error);
            alert('Failed to update learning list.'); 
        }
    
        toggleModal(); 
    };
    
    




    const getLast7Days = () => {
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            dates.push(date.toISOString().split('T')[0]);
        }
        return dates;
    };

   
    const [last7Days, setLast7Days] = useState(getLast7Days());


    useEffect(() => {   
        fetchBooks();
        fetchReadingHistory();
    }, [isLoggedIn, isLoginModalOpen]);

    const getWeekDates = (offset = 0) => {
        const endOfWeek = new Date();
        endOfWeek.setDate(endOfWeek.getDate() - endOfWeek.getDay() + 6 - 7 * offset); 
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const newDate = new Date(endOfWeek);
            newDate.setDate(newDate.getDate() - i);
            dates.push(newDate.toISOString().split('T')[0]);
        }
        return dates;
    };
    

    const handlePrevWeek = () => {
        setCurrentWeekOffset(currentWeekOffset + 1);
    };

    const handleNextWeek = () => {
        if (currentWeekOffset > 0) {
            setCurrentWeekOffset(currentWeekOffset - 1);
        }
    };

    useEffect(() => {
        setLast7Days(getWeekDates(currentWeekOffset));
    }, [currentWeekOffset]);

    return (
        <div className="container mx-auto p-4" style={{ backgroundColor: '#F3F8FF'}}>
                 {userEmail && (
    <div className="text-center">
        <span className="text-lg" style={{ backgroundColor: 'green', borderRadius: '10px', padding: '3px 10px', display: 'inline-block', color: 'white' }}>
            {userEmail}
        </span>
    </div>
)}



        <div className="text-center my-6">
        <div className="flex justify-between items-center my-6">
        <div className="invisible">
                    <button
                        className="font-bold py-2 px-4 rounded opacity-0"
                    >
                        Login
                    </button>
                </div>

                <h1 className="text-4xl font-bold" style={{ color: '#49108B' }}>Reading Tracker</h1>

                {isLoggedIn ? (
                    <button
                        onClick={handleLogoff}
                        className="font-bold py-2 px-4 rounded transition duration-300"
                        style={{ backgroundColor: '#8B0000', color: '#F3F8FF' }}
                    >
                        Logoff
                    </button>
                ) : (
                    <button
                        onClick={toggleLoginModal}
                        className="font-bold py-2 px-4 rounded transition duration-300"
                        style={{ backgroundColor: 'green', color: '#F3F8FF' }}
                    >
                        Login
                    </button>
                )}
            </div>

            <button
                onClick={navigateToBookList}
                className="font-bold py-2 px-4 mx-2 rounded transition duration-300"
                style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}
            >
                View Book List
            </button>
            <button onClick={toggleModal} className="font-bold py-2 px-4 mx-2 rounded transition duration-300" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}>Things To Learn</button>
         
        </div>

        


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



        
            <div className="my-10">
    <h2 className="text-3xl font-semibold mb-6 text-center" style={{ color: '#49108B' }}>Reading History</h2>
    <div className="flex justify-between">
                    <button onClick={handlePrevWeek} className="font-bold mb-4 py-2 px-4 rounded transition duration-300" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }}>
                        Prev Week
                    </button>
                    <button onClick={handleNextWeek} className="font-bold mb-4 py-2 px-4 rounded transition duration-300" style={{ backgroundColor: '#7E30E1', color: '#F3F8FF' }} disabled={currentWeekOffset === 0}>
                        Next Week
                    </button>
                </div>
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

{isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
                    <div className="relative top-20 mx-auto p-5 border h-3/4 w-3/4 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Things To Learn</h3>
                            <div className="mt-2">
                                <textarea
                                    className="w-full p-2 border rounded"
                                    style={{ minHeight: '80%'}}
                                    placeholder="Things To Learn..."
                                    rows="10"
                                    value={editorContent}
                                    onChange={(e) => setEditorContent(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="items-center px-4 py-3">
                            <button onClick={handleSaveContent} className="px-4 mx-4 py-2 bg-purple-500 text-white text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-900">Save</button>
                              
                            <button onClick={toggleModal} className= "my-2 mx-4 px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md w-1/2 shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-900">Close</button>
              
                             
                            </div>
                        </div>
                    </div>
                </div>
            )}

{isLoginModalOpen && <LoginModal toggleModal={toggleLoginModal} onSuccessfulLogin={handleSuccessfulLogin} />}


 
        </div>
    );
};

export default Home;
