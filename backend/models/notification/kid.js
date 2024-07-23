const mongoose = require("mongoose");
const { Schema } = mongoose;

const kidNotification = new Schema({
  kid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kid",
    required: true,
  },
  content: String,
});

module.exports = mongoose.model("KidNotification", kidNotification);
