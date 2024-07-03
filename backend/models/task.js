const mongoose = require("mongoose");
const { Schema } = mongoose;

const taskSchema = new Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true,
  },
  kid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Kid",
    required: true,
  },
  taskDescription: {
    type: String,
    required: true,
  },
  taskCost: {
    type: Number,
    required: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Task", taskSchema);
