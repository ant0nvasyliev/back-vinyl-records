const mongoose = require('mongoose');

const vinylSchema = new mongoose.Schema(
  {
    format: {
      type: String,
      // default: 'Vinyl',
    },
    description: {
      type: String
    },
    price: {
      type: String,
      // required: true,
    },
    artist: {
      type: String,
      // required: true,
    },
    album: {
      type: String
    },
    diameter: {
      type: Number
    },
    rpm: {
      type: Number
    },
    genre: {
      type: String
    },
    style: {
      type: String
    },
    recordLabel: {
      type: String
    },
    weight: {
      type: Number
    },
    condition: {
      type: String
    },
    coverCondition: {
      type: String
    },
    images: {
      type: String,
      // required: true,
    },
    id: {
      type: String,
      // required: true,
    },
    releaseYear: {
      type: Number,
      // required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      // required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

module.exports = mongoose.model('Vinyl', vinylSchema);