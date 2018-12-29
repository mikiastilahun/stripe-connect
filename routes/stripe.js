// create the routes for the user
const express = require("express");

const app = express.Router();

// import the controller
const stripe = require("../app/controllers/stripe");

app
  // charge the buyer and pay to the seller take some cut
  .post("/", (req, res) => {
    stripe.charge(req, res);
  })
  //link to the oauth sign-in of stripe
  .get("/authorize", (req, res) => {
    stripe.authorize(req, res);
  })
  // callback for stripe account linkage which saves the stripe account id to db
  .get("/token", (req, res) => {
    stripe.validate(req, res);
  })
  // link for payouts
  .get("/payout", (req, res) => {
    stripe.payout(req, res);
  })
  // view the transfers
  .get("/transfers", (req, res) => {
    stripe.transfers(req, res);
  });

module.exports = app;
