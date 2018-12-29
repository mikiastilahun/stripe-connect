const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  if (req.headers.authorization) {
    let token = req.headers.authorization;
    jwt.verify(token, process.env.SECRET, (err, doc) => {
      if (err) res.send(err);
      req.user = doc;
      next();
    });
  } else {
    // interchange the below code
    next();
    // res.json("token not provided");
  }
}
module.exports = verifyToken;
