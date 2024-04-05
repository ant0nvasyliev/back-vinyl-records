const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Set name for user"],
    },
    password: {
      type: String,
      required: [true, "Set password for user"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      index: true,
      unique: true,
    },
    // token: {
    //   type: String,
    //   default: null,
    // },
    avatarURL: {
      type: String,
    },
    // verify: {
    //   type: Boolean,
    //   default: false,
    // },
    isActivated: {
      type: Boolean,
      default: false,
    },
    isLoggedIn: {
      type: Boolean,
      default: false,
    },
    activationLink: {
      type: String,
      default: null,
    },
    // verifyToken: {
    //   type: String,
    //   default: null,
    //   required: [false, "Verify token is required"],
    // },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
