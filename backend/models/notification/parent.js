const mongoose = require("mongoose");
const { Schema } = mongoose;

const ParentNotification = new Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    require: true,
  },
  content: String,
  created_at: Date,
});

module.exports = mongoose.model("ParentNotification", ParentNotification);
