const mongoose = require("mongoose");
const { Schema } = mongoose;

const wishSchema = new Schema({
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parent", 
    },
    kid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Kid",
        required: true,
    },
    wishDescription: {
        type: String,
        required: true,
    },
    wishCost: {
        type: Number,
        required: true,
    },
    isFulfilled: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model("Wish", wishSchema);
