const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const gravatar = require("gravatar");
const sendEmail = require("../helpers/sendEmail");
const crypto = require("node:crypto");
const verifyToken = crypto.randomUUID();

const Joi = require("joi");

const userSchema = Joi.object({
  name:Joi.string().min(3).max(30),
  email: Joi.string().email(),
  password: Joi.string().min(3).max(30),
});

async function register(req, res, next) {
  const { email, password, name } = req.body;

  try {
    const validation = userSchema.validate(req.body);
    if (validation.error) {
      return res.status(400).send(validation.error.message);
    }
    const user = await User.findOne({ email });
    if (user !== null) {
      return res.status(409).send({ message: "Email in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const avatarURL = gravatar.url(email);

    sendEmail({
      to: "anton12vasyliev@gmail.com",
      from: "anton12vasyliev@gmail.com",
      subject: "Hello bulo4ka",
      html: `To confirm your registration please click on the <a href="http://localhost:3000/auth/verify/${verifyToken}">link</a>`,
      text: `To confirm your registration please click on the <a href="http://localhost:3000/auth/verify/${verifyToken}">link</a>`,
    });

    const result = await User.create({
      name,
      email,
      verifyToken,
      password: passwordHash,
      avatarURL,
    });
    res.status(201).send({
      user: {
        name,
        email: result.email,
        avatarURL: result.avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({ message: "Missing fields" });
  }

  const validation = userSchema.validate(req.body);
  if (validation.error) {
    return res.status(400).send(validation.error.message);
  }

  try {
    const user = await User.findOne({ email });
    if (user === null) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch === false) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    if (user.verify === false) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10h",
      }
    );
    await User.findByIdAndUpdate(user._id, { token });

    res.status(200).send({
      token,
      user: { email: user.email },
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
}

async function current(req, res) {
  const { email } = req.user;

  res.json({ email });
}

async function verify(req, res, next) {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verifyToken: token });

    if (user === null) {
      return res.status(404).send({ message: "User not found" });
    }

    await User.findByIdAndUpdate(user._id, { verify: true, verifyToken: null });
    res.send({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
}

async function resendVerify(req, res, next) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }
    if (user.verify) {
      return res
        .status(400)
        .send({ message: "Verification has already been passed" });
    }
    await sendEmail({
      to: "anton12vasyliev@gmail.com",
      from: "anton12vasyliev@gmail.com",
      subject: "Hello bulo4ka",
      html: `To confirm your registration please click on the <a href="http://localhost:3000/auth/verify/${verifyToken}">link</a>`,
      text: `To confirm your registration please click on the <a href="http://localhost:3000/auth/verify/${verifyToken}">link</a>`,
    });
    return res.status(200).send({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  logout,
  current,
  verify,
  resendVerify,
};
