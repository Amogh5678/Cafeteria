/**
 * @swagger
 * definitions:
 *   Wallet:
 *     type: object
 *     properties:
 *       managerId:
 *         type: string
 *       balance:
 *         type: number
 *
 * /wallet:
 *   post:
 *     summary: Deduct amount from manager's wallet
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/definitions/WalletDeduction'
 *     responses:
 *       200:
 *         description: Amount deducted successfully
 *       402:
 *         description: Insufficient manager balance
 *   post:
 *     summary: Refund amount to manager's wallet
 *     parameters:
 *       - in: body
 *         name: body
 *         schema:
 *           $ref: '#/definitions/WalletRefund'
 *     responses:
 *       200:
 *         description: Amount refunded successfully
 *       402:
 *         description: Invalid manager details
 *
 * definitions:
 *   WalletDeduction:
 *     type: object
 *     properties:
 *       managerId:
 *         type: string
 *       amount:
 *         type: number
 *   WalletRefund:
 *     type: object
 *     properties:
 *       managerId:
 *         type: string
 *       amount:
 *         type: number
 */
const express = require("express");
const Wallet = require("../models/Wallet")

const router = express.Router();

router.post("/deduct", async (req, res) => {
    const { managerId, amount } = req.body;
    console.log(req.body);

    const wallet = await Wallet.findOne({ managerId });
    if (!wallet || wallet.balance < amount) {
    return res.status(402).json({ message: "Insufficient manager balance" });
    }

    wallet.balance -= amount;
    await wallet.save();

    return res.status(200).json({ message: "Amount deducted successfully" });
})

router.post("/refund", async (req, res) => {
    const { managerId, amount } = req.body;
    amountNum = Number(amount)

    const wallet = await Wallet.findOne({ managerId });
    if (!wallet) {
        return res.status(402).json({ message: "Invalid manager details" });
    }

    wallet.balance += amountNum;
    await wallet.save();

    return res.status(200).json({ message: "Amount refunded successfully" });
})

module.exports = router;
