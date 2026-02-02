const checkInService = require("../services/checkin.service");

exports.checkIn = async (req, res) => {
  try {
    const result = await checkInService.checkIn(
      req.user.id,
      req.body.reservationId,
      req.body.checkInCode
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
