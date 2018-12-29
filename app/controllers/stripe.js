const stripe = require("stripe")(process.env.STRIPE_SKEY);
const querystring = require("querystring");
const request = require("request");
const debug = require("debug");
const db = require("../../models");

exports.charge = (req, res) => {
  const token = "tok_1DmSoLJANA27MJKbstwnDnD0";
  //const cardToken = req.body
  stripe.charges
    .create({
      amount: 99900000,
      currency: "usd",
      description: "Example charge",
      source: token,
      statement_descriptor: "Custom descriptor"
    })
    .then(charge => {
      res.send(charge);
    })
    .catch(err => {
      res.json(err);
    });
};

exports.authorize = (req, res) => {
  // Prepare the mandatory Stripe parameters.
  let parameters = {
    client_id: process.env.STRIPE_CLIENTID
  };
  // Optionally, Stripe Connect accepts `first_name`, `last_name`, `email`,
  // and `phone` in the query parameters for them to be autofilled.
  // parameters = Object.assign(parameters, {
  //   "stripe_user[business_type]":"individual",
  //   "stripe_user[first_name]": req.user.firstName || undefined,
  //   "stripe_user[last_name]": req.user.lastName || undefined,
  //   "stripe_user[email]": req.user.email
  // });
  // Redirect to Stripe to start the Connect onboarding.
  res.redirect(
    "https://connect.stripe.com/express/oauth/authorize" +
      "?" +
      querystring.stringify(parameters)
  );
};

exports.validate = (req, res) => {
  request.post(
    "https://connect.stripe.com/oauth/token",
    {
      form: {
        grant_type: "authorization_code",
        client_id: process.env.STRIPE_CLIENTID,
        client_secret: process.env.STRIPE_SKEY,
        code: req.query.code
      },
      json: true
    },
    (err, response, body) => {
      if (err || body.error) {
        debug("The Stripe onboarding process has not succeeded.");
      } else {
        // Update the model and store the Stripe account ID in the datastore.
        // This Stripe account ID will be used to pay out to the pilot.
        // db.User.update(
        //   { stripeId: body.stripe_user_id },
        //   {
        //     where: {
        //       email: req.user.email
        //     }
        //   }
        // ).then(res.json("Your account has been linked"));
        res.send(body.stripe_user_id);
      }
    }
  );
};

exports.payout = (req, res) => {
  // todo make a payout request in the place of users
};
exports.transfers = (req, res) => {
  // todo redirect users to show them the list of transfers on stripe dashboard
};
