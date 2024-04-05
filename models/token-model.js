const mongoose = require("mongoose");
const Schema = mongoose.Schema; // Import Schema from Mongoose

const tokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  refreshToken: { type: String, required: true },
});

module.exports = mongoose.model("Token", tokenSchema);

