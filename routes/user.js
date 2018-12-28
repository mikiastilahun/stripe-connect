// create the routes for the user
const express = require("express");

const app = express.Router();

// import the controller
const user = require("../app/controllers/user");

app
  // create the user
  .post("/create", (req, res) => {
    user.create(req, res);
  })
  // get the user info
  .get("/:id", (req, res) => {
    user.get(req, res);
  })
  // authenticate and send access token
  .post("/sign-in", (req, res) => {
    user.authenticate(req, res);
  });

module.exports = app;
