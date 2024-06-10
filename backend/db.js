const mongoose = require("mongoose");
async function run() {
  return await mongoose.connect(process.env.DB_STRING);
}

module.exports = run;
