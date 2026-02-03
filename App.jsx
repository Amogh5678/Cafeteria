import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import CafeReserve from './Booking'
import CheckInScreen from './checkInScreen'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<CafeReserve />} />
      <Route path="/checkin" element={<CheckInScreen />} />
    </Routes>
  )
}