const Reservation = require("../models/reservation.model");

exports.expireReservations = async () => {
  const now = new Date();

  const expired = await Reservation.updateMany(
    {
      status: "BOOKED",
      checkInDeadline: { $lt: now }
    },
    {
      $set: {
        status: "EXPIRED"
      }
    }
  );

  return expired.modifiedCount;
};
