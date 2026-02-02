import React, { useState } from 'react';
import { ArrowLeft, Delete } from 'lucide-react'; // If you don't have lucide-react, you can use an SVG or text for backspace
import './CheckInScreen.css';

const CheckInScreen = () => {
  const [pin, setPin] = useState("");

  const keys = [
    { num: '1', letters: '' },
    { num: '2', letters: 'ABC' },
    { num: '3', letters: 'DEF' },
    { num: '4', letters: 'GHI' },
    { num: '5', letters: 'JKL' },
    { num: '6', letters: 'MNO' },
    { num: '7', letters: 'PQRS' },
    { num: '8', letters: 'TUV' },
    { num: '9', letters: 'WXYZ' },
  ];

  const handleKeyPress = (value) => {
    if (pin.length < 4) {
      setPin((prev) => prev + value);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleVerify = async () => {
    // Basic validation
    if (pin.length !== 4) {
      alert("Please enter a 4-digit code.");
      return;
    }

    // ============================================================
    // 🔌 BACKEND INTEGRATION SECTION
    // ============================================================
    // 1. Call your backend API here to verify the code
    // try {
    //   const response = await fetch('/api/verify', { method: 'POST', body: JSON.stringify({ code: pin }) });
    //   const result = await response.json();
    //   if (!result.success) throw new Error('Invalid Code');
    // } catch (e) {
    //   alert("Verification failed");
    //   return; 
    // }
    // ============================================================

    // If backend verification passes:
    console.log("Verification Successful");

    // ⬇️ DUMMY MESSAGE (Remove this later)
    alert("Success! Redirecting to Home Page...");

    // ============================================================
    // 🏠 HOME PAGE REDIRECT FUNCTION
    // ============================================================
    // Add your navigation logic here.

    // Option A: If using React Router
    // navigate('/home'); 

    // Option B: Standard window redirect
    // window.location.href = '/home';

    console.log("Navigating to Home...");
  };

  return (
    <div className="container">
      <div className="card">
        {/* Header */}
        <div className="header">
          <h2>Confirm Your Check-In</h2>
          <p>Please enter the 4-digit code displayed on the main cafeteria screen.</p>
        </div>

        {/* Display Screen */}
        <div className="pin-display">
          <span className="pin-text">
            {pin.split('').join(' ')}
          </span>
        </div>

        {/* Keypad */}
        <div className="keypad-grid">
          {keys.map((key) => (
            <button
              key={key.num}
              className="key-btn"
              onClick={() => handleKeyPress(key.num)}
            >
              <span className="key-num">{key.num}</span>
              {key.letters && <span className="key-sub">{key.letters}</span>}
            </button>
          ))}

          {/* Bottom Row */}
          <div className="empty-key"></div>
          <button className="key-btn" onClick={() => handleKeyPress('0')}>
            <span className="key-num">0</span>
          </button>
          <button className="key-btn backspace-btn" onClick={handleBackspace}>
            {/* Simple SVG for backspace if you don't have an icon library */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path>
              <line x1="18" y1="9" x2="12" y2="15"></line>
              <line x1="12" y1="9" x2="18" y2="15"></line>
            </svg>
          </button>
        </div>

        {/* Action Button */}
        <button
          className="verify-btn"
          onClick={handleVerify}
        >
          Verify Code
        </button>
      </div>
    </div>
  );
};

export default CheckInScreen;
