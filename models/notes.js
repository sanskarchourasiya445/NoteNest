// models/notes.js
const mongoose = require("mongoose");
const User = require("./user.js");

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000,
    },
    user :{
    type : mongoose.Schema.Types.ObjectId,
    ref:"User",
  }
  },
  {
    timestamps: true,
  },
);

const Notes = mongoose.model("Notes", noteSchema);

module.exports = Notes;

