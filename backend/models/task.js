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
  taskStatus: {
    type: String,
    enum: ['new', 'in progress', 'completed', 'expired', 'failed', 'pending approval'], 
    default: 'new', 
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
  reminderSent: {
    type: Date
  },
});

module.exports = mongoose.model("Task", taskSchema);
