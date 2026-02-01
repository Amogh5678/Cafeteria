const express = require("express");
const router = express.Router();
const { checkIn } = require("../controllers/checkin.controller");

/**
 * @swagger
 * /checkin:
 *   post:
 *     summary: Check in to a reserved seat
 *     description: Confirms that the user is physically present in the cafeteria
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - checkInCode
 *             properties:
 *               reservationId:
 *                 type: string
 *                 example: res1
 *               checkInCode:
 *                 type: string
 *                 example: ABCDE
 *     responses:
 *       200:
 *         description: Check-in successful
 *       401:
 *         description: Invalid check-in code
 *       403:
 *         description: Unauthorized or check-in window expired
 *       404:
 *         description: Reservation not found
 *       409:
 *         description: Already checked in
 */
router.post("/checkin", checkIn);


module.exports = router;
