const mongoose = require("mongoose");
const initData = require("./data.js");
const Transction = require("../models/transction.js");

const MONGO_URL = "mongodb://localhost:27017/finance";

main().then(() => {
  console.log("connected to DB");
})
.catch((err) => {
 console.log(err);
})
async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async() => {
    await Transction.deleteMany({});
    await Transction.insertMany(initData.data);
    console.log("data was intialized");
};

initDB();