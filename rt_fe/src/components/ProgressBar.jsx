import React from 'react';
import '../index.css';

const ProgressBar = ({ percentage }) => {
    // Determine color based on the percentage
    const getColor = (percentage) => {
        if (percentage < 25) {
            return '#ff5722'; // Red-Orange
        } else if (percentage < 50) {
            return '#ff9800'; // Orange
        } else if (percentage < 75) {
            return '#ffc107'; // Amber
        } else {
            return '#4caf50'; // Green
        }
    };

    const fillerStyles = {
        height: '100%',
        width: `${percentage}%`,
        backgroundColor: getColor(percentage),
        borderRadius: 'inherit',
        textAlign: 'right',
        transition: 'width 1s ease-in-out',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end'
    };

    const labelStyles = {
        padding: '5px',
        color: 'white',
        fontWeight: 'bold',
        display: percentage > 5 ? 'block' : 'none' // Hide text if bar is too small
    };

    return (
        <div style={{ height: '20px', width: '100%', backgroundColor: '#e0e0de', borderRadius: '50px', overflow: 'hidden' }}>
            <div style={fillerStyles} className="glow">
                <span style={labelStyles}>{`${percentage}%`}</span>
            </div>
        </div>
    );
};

export default ProgressBar;
