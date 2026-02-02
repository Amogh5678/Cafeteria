const Reservation = require("../models/reservation.model");

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    res.status(200).json(reservation);
  } catch (err) {
    res.status(400).json({ message: "Invalid reservation ID" });
  }
};
