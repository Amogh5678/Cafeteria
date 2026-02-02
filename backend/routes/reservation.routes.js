const express = require("express");
const router = express.Router();
const {
  getReservationById
} = require("../controllers/reservation.controller");

router.get("/:id", getReservationById);

module.exports = router;
