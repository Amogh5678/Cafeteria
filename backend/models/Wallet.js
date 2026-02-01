const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  managerId: { type: String, unique: true },
  balance: { type: Number, required: true }
});

module.exports = mongoose.model("Wallet", walletSchema);
