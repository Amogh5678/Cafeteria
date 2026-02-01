import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './Home'
import CafeReserve from './Booking'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/booking" element={<CafeReserve />} />
    </Routes>
  )
}
