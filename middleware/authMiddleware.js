const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (typeof authHeader === "undefined") {
    return res.status(401).send({ message: "Not authorize" });
  }

  const [bearer, token] = authHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized 1" });
  }

  jwt.verify(token, process.env.JWT_ACCESS_SECRET, async (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized 2" });
    }

    const user = await User.findById(decode.id);

    if (user === null) {
      return res.status(401).send({ message: "User not found" });
    }

    if (user.isActivated === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    req.user = {
      id: decode.id,
      email: user.email,
    };
    next();
  });
}

module.exports = authMiddleware;
