const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;
const kidSchema = new Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Parent",
    required: true,
  },
  password: String,
  username: {
    type: String,
    unique: [true, "Username existed!"],
    required: true,
  },
  profilePicture: {
    type: String,
    default: "", 
  },
});
async function hashPassword(next) {
  const user = this;
  try {
    if (user.isModified("password")) {
      const hash = await bcrypt.hash(user.password, 10);
      user.password = hash;
    }
    next();
  } catch (e) {
    return next(e);
  }
}
kidSchema.pre("save", hashPassword);
module.exports = mongoose.model("Kid", kidSchema);
