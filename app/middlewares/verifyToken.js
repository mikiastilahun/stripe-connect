const jwt = require("jsonwebtoken");
const mo = require("moment");

function verifyToken(req, res, next) {
  if (req.headers.authorization) {
    let token = req.headers.authorization;
    jwt.verify(token, process.env.SECRET, (err, doc) => {
      if (err) {
        res.status(401).json("invalid token provided");
      }
      if (mo(doc.exp).diff(mo(), "seconds") <= 0) {
        res.status(401).json("the token has expired please issue a new one.");
      }
      req.user = doc;
      next();
    });
  } else res.status(401).json("token not provided");
}
module.exports = verifyToken;
