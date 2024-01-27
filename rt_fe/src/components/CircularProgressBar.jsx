import React from 'react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const CircularProgressBar = ({ percentage }) => {
  return (
    <div style={{ width: '100px', height: '100px' }}>
      <CircularProgressbar value={percentage} text={`${percentage}%`} />
    </div>
  );
};

export default CircularProgressBar;
