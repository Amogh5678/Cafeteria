
const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middleware/authMiddleware');

// Import Reservation model (assumes you have this)
// const Reservation = require('../models/Reservation');

/**
 * POST /reservations/create
 * Create a new reservation
 * 
 * Frontend calls this when "Reserve" button is clicked
 * Returns: { success: true, id: reservationId, ... }
 */
router.post('/create', ensureAuth, async (req, res) => {
  try {
    const { seatId, startTime, endTime, date } = req.body;
    const userId = req.user.id;

    // ✅ Validation
    if (!seatId || !startTime || !endTime || !date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: seatId, startTime, endTime, date',
      });
    }

    // ✅ Validate seat ID (1-100)
    if (seatId < 1 || seatId > 100) {
      return res.status(400).json({
        success: false,
        message: 'Invalid seat ID. Must be between 1 and 100',
      });
    }

    // ✅ Validate time format (HH:MM)
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time format. Use HH:MM',
      });
    }

    // ✅ Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }

    // ✅ Validate start time < end time
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (startMinutes >= endMinutes) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // ✅ Validate max duration (1 hour = 60 minutes)
    const duration = endMinutes - startMinutes;
    if (duration > 60) {
      return res.status(400).json({
        success: false,
        message: 'Maximum booking duration is 1 hour',
      });
    }

    // ✅ Check for conflicts with existing reservations
    // IMPORTANT: Uncomment when you have Reservation model
    /*
    const conflictingReservation = await Reservation.findOne({
      seatId,
      date,
      status: { $in: ['confirmed', 'checked-in'] },
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    });

    if (conflictingReservation) {
      return res.status(409).json({
        success: false,
        message: 'Seat is already booked for this time slot',
      });
    }

    // ✅ Create new reservation
    const reservation = new Reservation({
      userId,
      seatId,
      startTime,
      endTime,
      date,
      status: 'confirmed',
      bookedAt: new Date(),
    });

    await reservation.save();

    return res.status(201).json({
      success: true,
      id: reservation._id,
      seatId: reservation.seatId,
      startTime: reservation.startTime,
      endTime: reservation.endTime,
      date: reservation.date,
      status: reservation.status,
      bookedAt: reservation.bookedAt,
      message: 'Booking created successfully',
    });
    */

    // ✅ TEMPORARY MOCK RESPONSE (for testing without DB)
    // Remove this block once you have the Reservation model
    const mockReservation = {
      id: `TEMP_${Date.now()}`,
      userId,
      seatId,
      startTime,
      endTime,
      date,
      status: 'confirmed',
      bookedAt: new Date(),
    };

    console.log('✅ Mock reservation created:', mockReservation);

    return res.status(201).json({
      success: true,
      id: mockReservation.id,
      seatId: mockReservation.seatId,
      startTime: mockReservation.startTime,
      endTime: mockReservation.endTime,
      date: mockReservation.date,
      status: mockReservation.status,
      bookedAt: mockReservation.bookedAt,
      message: 'Booking created successfully',
    });

  } catch (error) {
    console.error('❌ Reservation creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    });
  }
});

/**
 * GET /reservations
 * Fetch all reservations for the current user
 */
router.get('/', ensureAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // UNCOMMENT when you have Reservation model
    /*
    const reservations = await Reservation.find({ userId })
      .sort({ bookedAt: -1 });

    return res.json({
      success: true,
      count: reservations.length,
      reservations,
    });
    */

    // TEMPORARY MOCK RESPONSE
    return res.json({
      success: true,
      count: 0,
      reservations: [],
      message: 'Mock response - implement with Reservation model',
    });

  } catch (error) {
    console.error('❌ Error fetching reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * DELETE /reservations/:id
 * Cancel a reservation (only within 15 minutes of booking)
 */
router.delete('/:id', ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // UNCOMMENT when you have Reservation model
    /*
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (reservation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Check if cancellation window is still open (15 minutes)
    const now = new Date();
    const timeDiff = (now - reservation.bookedAt) / (1000 * 60); // minutes
    if (timeDiff > 15) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation period expired',
      });
    }

    await Reservation.findByIdAndUpdate(id, { status: 'cancelled' });

    return res.json({
      success: true,
      message: 'Reservation cancelled successfully',
    });
    */

    // TEMPORARY MOCK RESPONSE
    return res.json({
      success: true,
      message: 'Mock cancellation - implement with Reservation model',
    });

  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

/**
 * POST /reservations/:id/check-in
 * Check in to a reservation
 */
router.post('/:id/check-in', ensureAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // UNCOMMENT when you have Reservation model
    /*
    const reservation = await Reservation.findById(id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found',
      });
    }

    if (reservation.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    if (reservation.status !== 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'Can only check in confirmed reservations',
      });
    }

    await Reservation.findByIdAndUpdate(id, { 
      status: 'checked-in',
      checkedInAt: new Date()
    });

    return res.json({
      success: true,
      message: 'Check-in successful',
    });
    */

    // TEMPORARY MOCK RESPONSE
    return res.json({
      success: true,
      message: 'Mock check-in - implement with Reservation model',
    });

  } catch (error) {
    console.error('❌ Error checking in:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

module.exports = router;