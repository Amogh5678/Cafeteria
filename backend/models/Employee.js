const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, unique: true },
  name: String,
  managerId: String
});

module.exports = mongoose.model("Employee", employeeSchema);
