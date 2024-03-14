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
    
            backgroundColor: '#F3F8FF',
        }}>
            <button onClick={navigateHome} className="floating-button" style={{ 
                width: '70px', 
                height: '70px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                backgroundColor: '#7E30E1',
                color: '#F3F8FF', 
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                boxShadow: '0 2px 4px #49108B',
            }}>
                Home
            </button>
        </nav>
    );
};

export default Navbar;
