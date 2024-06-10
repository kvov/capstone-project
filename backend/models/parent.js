const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;
const parentSchema = new Schema({
  password: String,
  username: {
    type: String,
    unique: [true, "Username existed!"],
    required: true,
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
parentSchema.pre("save", hashPassword);
module.exports = mongoose.model("Parent", parentSchema);
