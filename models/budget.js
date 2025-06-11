const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const budgetSchema = new Schema ({
     user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  month: {
    type: String, // Format: "YYYY-MM"
    required: true
  },
  categories: {
    Housing: { type: Number, default: 0 },
    Food: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Health: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Others: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', budgetSchema);

