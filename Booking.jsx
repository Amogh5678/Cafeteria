import { ChevronLeft, Coffee, X, Clock, Calendar, QrCode, CheckCircle2, Sun, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export default function CafeReserve() {
  const [currentScreen, setCurrentScreen] = useState('reserve'); // 'reserve' or 'bookings'
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInCode, setCheckInCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [activeCheckIn, setActiveCheckIn] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHoverImHere, setIsHoverImHere] = useState(false);

  const navigate = useNavigate();

  const handleImHereClick = () => navigate('/chkin');

  // Generate seats with seat types
  const generateSeats = () => {
    const seats = [];
    const rows = 10;
    const cols = 10;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const seatNum = row * cols + col + 1;
        let seatType = 'regular';
        if (col === 0 || col === 9) {
          seatType = 'window';
        } else if (row === 0 || row === 1) {
          seatType = 'sunlight';
        }
        
        seats.push({
          id: seatNum,
          type: seatType,
          isOccupied: false
        });
      }
    }
    return seats;
  };

  const [seats] = useState(generateSeats());

  const [bookings, setBookings] = useState([
    {
      id: 1,
      seatId: 42,
      date: 'Today',
      time: '12:30 PM - 1:30 PM',
      bookedAt: new Date(Date.now() - 2 * 60 * 1000),
      status: 'confirmed'
    },
    {
      id: 2,
      seatId: 42,
      date: 'Today',
      time: '11:10 PM - 1:30 PM',
      bookedAt: new Date(Date.now() - 10 * 60 * 1000),
      status: 'confirmed'
    }
  ]);

  // Update bookings timer
  useEffect(() => {
    const interval = setInterval(() => {
      setBookings(prev => [...prev]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function showNotificationMsg(msg) {
    setNotificationMessage(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }

  function handleSeatClick(seat) {
    if (!seat.isOccupied) {
      setSelectedSeat(selectedSeat === seat.id ? null : seat.id);
    }
  }

  function formatTime12Hour(time24) {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${period}`;
  }

  function calculateDuration(start, end) {
    if (!start || !end) return 0;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60;
  }

  function timeToMinutes(time24) {
    if (!time24) return 0;
    const [hours, minutes] = time24.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function parseTimeFromFormatted(timeStr) {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  function checkTimeOverlap(seatId, newStart, newEnd) {
    const newStartMin = timeToMinutes(newStart);
    const newEndMin = timeToMinutes(newEnd);

    return bookings.some(booking => {
      if (booking.seatId !== seatId || booking.status === 'cancelled') return false;
      
      const [startStr, endStr] = booking.time.split(' - ');
      const bookingStart24 = parseTimeFromFormatted(startStr);
      const bookingEnd24 = parseTimeFromFormatted(endStr);
      
      const bookingStartMin = timeToMinutes(bookingStart24);
      const bookingEndMin = timeToMinutes(bookingEnd24);
      
      return (newStartMin < bookingEndMin && newEndMin > bookingStartMin);
    });
  }

  function isSeatOccupiedForTime(seatId, start, end) {
    if (!start || !end) return false;
    return checkTimeOverlap(seatId, start, end);
  }

  async function handleConfirmBooking() {
    if (!selectedSeat || !startTime || !endTime) {
      showNotificationMsg('⚠️ Please select a seat, start time, and end time');
      return;
    }

    const duration = calculateDuration(startTime, endTime);
    
    if (duration <= 0) {
      showNotificationMsg('⚠️ End time must be after start time');
      return;
    }

    if (duration > 1) {
      showNotificationMsg('⚠️ Maximum booking duration is 1 hour');
      return;
    }

    if (checkTimeOverlap(selectedSeat, startTime, endTime)) {
      showNotificationMsg('⚠️ This seat is already booked for this time slot!');
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch('http://localhost:8080/reservations/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          seatId: selectedSeat,
          startTime: startTime,
          endTime: endTime,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create booking');
      }

      const data = await response.json();
      const newBooking = {
        id: Date.now(),
        seatId: selectedSeat,
        date: 'Today',
        time: `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`,
        bookedAt: new Date(),
        status: 'confirmed'
      };

      setBookings([newBooking, ...bookings]);
      showNotificationMsg('✅ Booking confirmed and saved!');
      
      setTimeout(() => {
        setSelectedSeat(null);
        setStartTime('');
        setEndTime('');
        setCurrentScreen('bookings');
      }, 1500);
    } catch (error) {
      console.error('Booking error:', error);
      showNotificationMsg(`❌ ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  function getTimeRemaining(bookedAt) {
    const now = new Date();
    const timeDiff = 15 - (now - new Date(bookedAt)) / (1000 * 60);
    return Math.max(0, timeDiff);
  }

  function canCancelBooking(bookedAt) {
    return getTimeRemaining(bookedAt) > 0;
  }

  function getCountdownPercentage(bookedAt) {
    const timeRemaining = getTimeRemaining(bookedAt);
    return (timeRemaining / 15) * 100;
  }

  function handleCancelClick(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!canCancelBooking(booking.bookedAt)) {
      showNotificationMsg('⚠️ Cancellation period expired');
      return;
    }
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
  }

  function confirmCancel() {
    setBookings(bookings.filter(b => b.id !== cancelBookingId));
    setShowCancelModal(false);
    setCancelBookingId(null);
    showNotificationMsg('✅ Booking cancelled');
  }

  function generateCheckInCode() {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  function handleCheckInRequest(booking) {
    const code = generateCheckInCode();
    setCheckInCode(code);
    setActiveCheckIn(booking);
    setInputCode('');
    setShowCheckInModal(true);
  }

  function handleCheckIn() {
    if (inputCode === checkInCode) {
      setBookings(bookings.map(b => 
        b.id === activeCheckIn.id 
          ? { ...b, status: 'checked-in' }
          : b
      ));
      setShowCheckInModal(false);
      showNotificationMsg('✅ Check-in successful!');
      setActiveCheckIn(null);
      setInputCode('');
    } else {
      showNotificationMsg('❌ Incorrect code');
    }
  }

  function handleViewDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    setSelectedBookingDetails(booking);
    setShowDetailsModal(true);
  }

  function getSeatIcon(seatType) {
    if (seatType === 'window') {
      return <Wind size={12} className="text-blue-500" />;
    } else if (seatType === 'sunlight') {
      return <Sun size={12} className="text-yellow-500" />;
    }
    return null;
  }

  function getSeatColor(seat) {
    const isOccupied = isSeatOccupiedForTime(seat.id, startTime, endTime);
    const isSelected = selectedSeat === seat.id;
    
    if (isOccupied) {
      return 'bg-red-100 text-red-400 cursor-not-allowed';
    } else if (isSelected) {
      return 'bg-orange-500 text-white shadow-lg scale-110';
    } else {
      return 'bg-green-100 text-green-700 hover:bg-green-200';
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 font-sans">
      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
          <div className="bg-white shadow-2xl rounded-2xl px-6 py-4 flex items-center gap-3 border-2 border-orange-200">
            <span className="text-sm font-bold text-gray-900">{notificationMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white shadow-lg border-b-4 border-orange-500 p-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Cafe Reserve
          </h1>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setCurrentScreen('reserve')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              currentScreen === 'reserve'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            🍽️ Reserve a Seat
          </button>
          <button
            onClick={() => setCurrentScreen('bookings')}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
              currentScreen === 'bookings'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            📅 Your Bookings
          </button>
        </div>

        {/* I'm Here Button */}
        <button
          onClick={handleImHereClick}
          onMouseEnter={() => setIsHoverImHere(true)}
          onMouseLeave={() => setIsHoverImHere(false)}
          style={{
            background: isHoverImHere ? '#1a6428' : '#22863A',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '300px',
            margin: '0 auto',
            transition: 'all 0.2s ease',
            boxShadow: isHoverImHere ? '0 4px 12px rgba(34, 134, 58, 0.3)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
            transform: isHoverImHere ? 'translateY(-2px)' : 'translateY(0)',
          }}
        >
          <MapPin size={20} />
          📍 I'm Here!
        </button>
      </div>

      {/* Check-In Modal */}
      {showCheckInModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Confirm Your Check-In</h2>
              <button onClick={() => setShowCheckInModal(false)}>
                <X className="text-gray-400" size={24} />
              </button>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
              <p className="text-sm text-orange-600 font-semibold mb-3 text-center">
                Please enter the 4-digit code displayed on the main cafeteria screen
              </p>
              <div className="bg-white rounded-xl p-4 mb-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Code on screen:</div>
                <div className="text-3xl font-mono font-bold text-orange-600 tracking-widest">
                  {checkInCode}
                </div>
              </div>
              <input
                type="text"
                maxLength="4"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter code"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-center text-2xl font-mono font-bold tracking-widest focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={inputCode.length !== 4}
              className={`w-full py-4 rounded-xl font-bold text-white shadow-lg ${
                inputCode.length === 4
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              Verify & Check In
            </button>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scaleIn">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Cancel Booking?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to cancel this booking? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold"
              >
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBookingDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scaleIn">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
              <button onClick={() => setShowDetailsModal(false)}>
                <X className="text-gray-400" size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                <div className="text-sm text-orange-600 font-semibold mb-1">Seat Number</div>
                <div className="text-3xl font-bold text-orange-600">#{selectedBookingDetails.seatId}</div>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="text-sm text-blue-600 font-semibold mb-1">Date & Time</div>
                <div className="text-lg font-bold text-blue-700">{selectedBookingDetails.date}</div>
                <div className="text-md text-blue-600">{selectedBookingDetails.time}</div>
              </div>

              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="text-sm text-green-600 font-semibold mb-1">Status</div>
                <div className="text-lg font-bold text-green-700 capitalize">
                  {selectedBookingDetails.status === 'checked-in' ? 'Checked In' : 'Confirmed'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full mt-6 py-3 bg-gray-800 text-white rounded-xl font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RESERVE SCREEN */}
      {currentScreen === 'reserve' && (
        <div className="p-6">
          {/* Time Selection First */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="text-orange-500" size={20} />
              Select Time Slot
            </h2>
            
            <div className="space-y-3">
              {/* Start Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-900 font-medium"
                />
              </div>

              {/* End Time */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-gray-900 font-medium"
                />
              </div>
            </div>

            {startTime && endTime && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-xs text-blue-600 font-semibold mb-1">Duration</div>
                <div className="text-lg font-bold text-blue-700">
                  {formatTime12Hour(startTime)} - {formatTime12Hour(endTime)}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  {calculateDuration(startTime, endTime).toFixed(1)} hour(s)
                </div>
              </div>
            )}
          </div>

          {/* Seat Grid - Only show when time is selected */}
          {startTime && endTime ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Coffee className="text-orange-500" size={20} />
                Select a Seat
              </h2>
              
              <div className="grid grid-cols-10 gap-2 mb-4">
                {seats.map((seat) => {
                  return (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={isSeatOccupiedForTime(seat.id, startTime, endTime)}
                      className={`
                        aspect-square rounded-lg text-xs font-semibold transition-all relative
                        ${getSeatColor(seat)}
                      `}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        {getSeatIcon(seat.type)}
                        <span className="mt-0.5">{seat.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded border border-green-300"></div>
                    <span className="text-gray-600">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <span className="text-gray-600">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded border border-red-300"></div>
                    <span className="text-gray-600">Occupied</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <Wind size={16} className="text-blue-500" />
                    <span className="text-gray-600">Window Seat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun size={16} className="text-yellow-500" />
                    <span className="text-gray-600">Sunlight Seat</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-gray-400" size={40} />
              </div>
              <p className="text-gray-500 text-sm">Select start and end time to see available seats</p>
            </div>
          )}

          {selectedSeat && (
            <>
              {/* Selected Seat Info */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                <div>
                  <div className="text-sm text-orange-600 font-semibold mb-1">Selected Seat</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-orange-600">#{selectedSeat}</div>
                    {getSeatIcon(seats.find(s => s.id === selectedSeat)?.type)}
                  </div>
                </div>
                <Coffee className="text-orange-400" size={40} />
              </div>

              <button
                onClick={handleConfirmBooking}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-xl'
                }`}
              >
                {isLoading ? '🔄 Processing...' : 'Confirm Booking'}
              </button>
            </>
          )}
        </div>
      )}

      {/* BOOKINGS SCREEN */}
      {currentScreen === 'bookings' && (
        <div className="p-6">
          {bookings.filter(b => b.status !== 'cancelled').length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="text-gray-400" size={48} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500 mb-6">Reserve a seat to get started</p>
              <button
                onClick={() => setCurrentScreen('reserve')}
                className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold"
              >
                Reserve a Seat
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.filter(b => b.status !== 'cancelled').map((booking) => {
                const timeRemaining = getTimeRemaining(booking.bookedAt);
                const canCancel = canCancelBooking(booking.bookedAt);
                const countdownPercentage = getCountdownPercentage(booking.bookedAt);
                const minutes = Math.floor(timeRemaining);
                const seconds = Math.floor((timeRemaining - minutes) * 60);

                return (
                  <div key={booking.id} className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-sm font-bold text-gray-900 mb-1">
                          {booking.date}, {booking.time}
                        </div>
                        <div className="text-sm text-gray-600">Seat #{booking.seatId}</div>
                      </div>
                      {booking.status === 'confirmed' && (
                        <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Confirmed
                        </div>
                      )}
                      {booking.status === 'checked-in' && (
                        <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Checked In
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {canCancel && booking.status === 'confirmed' ? (
                        <button
                          onClick={() => handleCancelClick(booking.id)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-semibold relative overflow-hidden bg-gray-400"
                        >
                          <div 
                            className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-1000 ease-linear"
                            style={{ width: `${countdownPercentage}%` }}
                          ></div>
                          <div className="relative z-10 flex items-center justify-center gap-2 text-white">
                            <span className="font-semibold">Cancel Booking</span>
                            <Clock className="text-white" size={14} />
                            <span className="text-xs">
                              ({minutes}:{seconds.toString().padStart(2, '0')} remaining)
                            </span>
                          </div>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleViewDetails(booking.id)}
                          className="flex-1 py-2.5 bg-gray-400 text-white rounded-xl text-sm font-semibold"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}