import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../Navbar.css'; 

const Navbar = () => {
    const navigate = useNavigate();

    const navigateHome = () => {
        navigate('/');
    };

    return (
        <nav style={{ 
            display: 'flex', 
            justifyContent: 'flex-end', 
    
            backgroundColor: '#F3F8FF', // Light blue background
        }}>
            <button onClick={navigateHome} className="floating-button" style={{ 
                width: '70px', // Fixed width
                height: '70px', // Fixed height to maintain circle shape
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                backgroundColor: '#7E30E1', // Dark purple background
                color: '#F3F8FF', // Light blue text
                border: 'none',
                borderRadius: '50%', // Circle shape
                cursor: 'pointer',
                boxShadow: '0 2px 4px #49108B', // Deeper purple shadow
            }}>
                Home
            </button>
        </nav>
    );
};

export default Navbar;
