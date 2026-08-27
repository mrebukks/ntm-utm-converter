const express = require("express");
const path = require("path");
// importing the converter path
const converterRoute = require("./routes/converter");

const app = express();

const Port = 3000;

// Middleware to parse incoming JSON & URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, client-side JS) from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Serve the HTML file when users access the home route ("/")
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "uploads", "views", "index.html"));
});

// Register the converter route
app.use("/", converterRoute);

app.listen(Port || 3000, () => {
  console.log("successfully listening");
});

console.log("successfully listening");
