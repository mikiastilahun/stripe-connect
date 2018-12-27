// entry point for the app
// node_modules
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

// don't use console.log instead use debug
const debug = require("debug")("app");

// import the routes

// init the app
const app = express();

//apply the cors middleware
app.use(cors());

// parse the body-content
app.use(bodyparser.json());

//start the server
app.listen(process.env.PORT ? process.env.PORT : 3000, err => {
  if (err) debug(err);
  else debug(`${process.env.APP_NAME}has started on port ${process.env.PORT}`);
});
