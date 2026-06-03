const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const multer = require("multer");

const app = express();
app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "deepaksingh.bvminfotech@gmail.com",
    pass: "aewasceoosgevtxi",
  },
});
// Files
const storage = multer.diskStorage({
  //destination to store file
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  // File Original Name
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
// multer object to handle file uploads
const uploads = multer({ storage });
app.post("/api/send", uploads.array("files"), (req, res) => {
  const mailOptions = {
    from: "deepaksingh.bvminfotech@gmail.com",
    to: req.body.to,
    subject: req.body.subject,
    html: req.body.message,
    attachments: req.files.map((file) => {
      console.log("File Original Name :", file.originalname);
      console.log("File-Path :", file.path);
      return {
        filename:file.originalname,
        path:file.path,
      };
    }),
  };
  transporter.sendMail(mailOptions);
  res.send("Email Send Successfully !!");
});

const PORT = 8020;
app.listen(PORT, () => {
  console.log("Server Start Successfully !!");
});
