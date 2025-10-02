const mongoose = require("mongoose");
const initData = require("./data.js");
const Notes = require("../models/notes.js");

const colors = require("colors");

const dbUrl ="mongodb://127.0.0.1:27017/Notes";

main()
.then(() =>{
  console.log("Connected to DB".bgGreen);
})
.catch((err) =>{
  console.group(err);
});
async function main(){
  await mongoose.connect(dbUrl);
}

const initDB = async() =>{
  await Notes.deleteMany({});
  await Notes.insertMany(initData.data);
  console.log("data was initialized");
  
};

initDB();