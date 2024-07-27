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
  recurrence: {
    type: {
      frequency: {
        type: String, // e.g., "daily", "weekly", "monthly"
        required: true,
      },
      interval: {
        type: Number, // e.g., every 1 week, every 2 weeks
        required: true,
      },
      daysOfWeek: {
        type: [Number], // e.g., [1, 3, 5] for Monday, Wednesday, Friday
      },
    },
  },
  createTime: {
      type: Date,
      default: Date.now
  },
});

module.exports = mongoose.model("Task", taskSchema);
