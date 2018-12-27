// entry point for the app
// node_modules
const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");

// don't use console.log instead use debug
const debug = require("debug");

// init the app
const app = express();

//apply the cors middleware
app.use(cors());

// parse the body-content
app.use(bodyparser.json());

//start the server
app.listen();
