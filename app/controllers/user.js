// node_modules
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");

const debug = require("debug")("userController");
// import the models to manipulate
const db = require("../../models");

/* create the user*/
exports.create = (req, res) => {
  let { firstName, lastName, email, password } = req.body;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) res.status(500).json("err");
    db.User.findOrCreate({
      where: {
        firstName,
        lastName,
        email
      }
    })
      .then(user => {
        if (!user[1]) res.status(422).json([{ message: "user duplicate" }]);
        else {
          db.User.update(
            {
              password: hash
            },
            {
              where: {
                firstName,
                lastName,
                email
              }
            }
          ).then(() => {
            res.json(user);
          });
        }
      })

      .catch(error => {
        debug(error);
        res.status(500).json(error.errors);
      });
  });
};

/* get the user*/
exports.get = (req, res) => {
  const { id } = req.params;
  db.User.findOne({ where: { id } })
    .then(user => {
      const { id, firstName, lastName, email } = user;
      res.json({ id, firstName, lastName, email });
    })
    .catch(error => {
      debug(error);
      res.status(500).json(error);
    });
};
/* authenticate the user*/
exports.authenticate = (req, res) => {
  const { email, password } = req.body;
  db.User.findOne({
    where: {
      email
    }
  }).then(user => {
    bcrypt.compare(password, user.password, (err, response) => {
      if (err) res.status(500).json(err);
      else {
        if (!response)
          res.status(401).json([{ message: "invalid authentication" }]);
        else {
          const data = {
            userId: user.id,
            stripeId: user.StripeId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          };
          const mo = moment().unix();
          const token = jwt.sign(
            {
              // token expires in 30 days
              exp: mo + 30 * 24 * 3600
            },
            process.env.SECRET
          );
          res.json({ Bearer: token });
        }
      }
    });
  });
};
