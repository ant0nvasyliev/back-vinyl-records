const jwt = require("jsonwebtoken");
const User = require("../models/user");

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (typeof authHeader === "undefined") {
    return res.status(401).send({ message: "Not authorized" });
  }

  const [bearer, token] = authHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).send({ message: "Not authorized" });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
    if (err) {
      return res.status(401).send({ message: "Not authorized" });
    }

    const user = await User.findById(decode.id);

    if (user === null) {
      return res.status(401).send({ message: "Invalid token" });
    }

    if (user.token !== token) {
      return res.status(401).send({ message: "Invalid token" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    req.user = {
      id: decode.id,
      email: user.email,
      subscription: user.subscription,
    };
    next();
  });
}

module.exports = authMiddleware;
