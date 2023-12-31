const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

let connOffice, connUser;
main().catch((err) => console.log(err));

async function main() {
  connUser = mongoose.createConnection("mongodb://127.0.0.1:27017/user_data");

  connOffice = mongoose.createConnection(
    "mongodb://127.0.0.1:27017/office_data"
  );

  console.log("db connected");
  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

const officeDataSchema = new mongoose.Schema({
  chair_id: Number,
  date_created: Date,
  for_date: Date,
  emp_id: String,
});

const userDataSchema = new mongoose.Schema({
  emp_id: String,
  password: String,
  email: String,
});

const OfficeData = connOffice.model("OfficeData", officeDataSchema);
const UserData = connUser.model("UserData", userDataSchema);
const server = express();

server.use(cors());
server.use(bodyParser.json());

server.get("/demo", async (_, res) => {
  const currDate = new Date();
  // console.log(currDate);
  const forDate = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    currDate.getDate() + 1,
    5,
    30
  );
  // console.log(currDate.getDate());
  // forDate.setDate(currDate.getDate() + 1);
  // forDate.setHours(0);
  // console.log(forDate);
  const data = await OfficeData.find({ for_date: forDate });
  console.log(data);
  console.log("data sent");
  res.json(data);
});

server.post("/demo", async (req, res) => {
  //   console.log(req);
  // console.log("request recieved");
  // console.log(req.body);
  const currDate = new Date();
  // console.log(currDate);
  const forDate = new Date(
    currDate.getFullYear(),
    currDate.getMonth(),
    currDate.getDate() + 1,
    5,
    30
  );
  const data = await OfficeData.find({
    emp_id: req.body.emp_id,
    for_date: forDate,
  });
  if (data.length !== 0) {
    res.json("REJECTED");
  } else {
    const cleanedData = {
      chair_id: req.body.chair_id,
      date_created: req.body.date_created,
      for_date: req.body.for_date,
      emp_id: req.body.emp_id,
    };
    // console.log(cleanedData);
    const entry = new OfficeData(cleanedData);
    await entry.save();
    res.json("ACCEPTED");
  }
});

server.post("/login", async (req, res) => {
  // console.log(req.body);
  let message = {};
  const data = await UserData.find({ emp_id: req.body.emp_id });
  // console.log(data[0]);
  // console.log(!data);
  if (data.length === 0) {
    message["return"] = "Username does not exist!";
  } else if (req.body.password !== data[0].password) {
    message["return"] = "Wrong password!";
  } else {
    console.log(data);
    message["return"] = "OK";
    message["login_date"] = new Date();
    message["user"] = req.body.emp_id;
    message["email"] = data[0].email;
  }
  res.json(message);
});

server.post("/register", async (req, res) => {
  console.log(req.body);
  let message = {};
  const data = await UserData.find({ emp_id: req.body.emp_id });
  // console.log(data[0]);
  // console.log(!data);
  if (data.length !== 0) {
    message["return"] = "User already exists!";
  } else {
    const data = new UserData(req.body);
    await data.save();
    message["return"] = "User saved. Logging In Automatically!";
    message["creation_date"] = new Date();
    message["user"] = req.body.emp_id;
    message["email"] = data.email;
    // message["cookie_id"] = "some random generated string!";
  }
  res.json(message);
});

server.post("/history", async (req, res) => {
  console.log(req.body);
  const data = await OfficeData.find({ emp_id: req.body.id });
  let message = {};
  if (data.length === 0) {
    message["return"] = "NOT_FOUND";
  } else {
    message["return"] = "OK";
    message["data"] = data;
  }
  res.json(message);
});

server.listen(8080, () => {
  console.log("server started");
});
