const mongoose = require("mongoose");
const { Schema } = mongoose;

const kidNotification = new Schema({
  kid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kid",
    required: true,
  },
  created_at: Date,
  content: String,
  status: {
    type: String,
    enum: ['read', 'unread'],
    default: 'unread',
  },
});

module.exports = mongoose.model("KidNotification", kidNotification);
