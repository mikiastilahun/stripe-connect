const stripe = require("stripe")(process.env.STRIPE_SKEY);
const querystring = require("querystring");
const request = require("request");
const debug = require("debug")("stripe");
const db = require("../../models");

exports.charge = (req, res) => {
  const token = "tok_visa";
  //const cardToken = req.body
  stripe.charges
    .create({
      amount: 999,
      currency: "usd",
      description: "Example charge",
      source: token,
      statement_descriptor: "Custom descriptor",
      destination: {
        // the destination of the charge would be the user selling the item
        account: "acct_1DmdnODhOv2SClZp"
      }
    })
    .then(charge => {
      res.send(charge);
    })
    .catch(err => {
      debug(err);
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
        // This Stripe account ID will be used to pay out to the users.
        // db.User.update(
        //   { stripeId: body.stripe_user_id },
        //   {
        //     where: {
        //       email: req.user.email
        //     }
        //   }
        // redirect to frontend with the new token in the query string
        //).then(res.send(body.stripe_user_id));
        //res.redirect(process.env.FRONTEND_URL));
        res.send(body.stripe_user_id);
      }
    }
  );
};

exports.payout = async (req, res) => {
  try {
    // get the balance of the user from the token
    const balance = await stripe.balance.retrieve({
      // change the stripe account to the auth one
      //stripe_account: req.user.StripeId
      stripe_account: "acct_1DmdnODhOv2SClZp"
    });
    // only use usd currency but there are lot of balances with different currency
    const { amount, currency } = balance.available[0];
    debug(amount, currency);
    // create the payout with the total available amount
    const payout = await stripe.payouts.create(
      {
        amount: 2,
        currency,
        statement_descriptor: process.env.APP_NAME
      },
      { stripe_account: "acct_1DmdnODhOv2SClZp" }
    );
    res.json(payout);
  } catch (e) {
    debug(e);
    res.json(e);
  }
  // the payouts has been successful
};
exports.transfers = async (req, res) => {
  debug("excutting transfers ");
  try {
    const uniqueLoginLink = await stripe.accounts.createLoginLink(
      // change this account to the authenticated user account
      "acct_1DnV4mByfcKAN3an"
    );
    debug(uniqueLoginLink);
    res.redirect(uniqueLoginLink.url);
  } catch (e) {
    debug(e);
  }
};
