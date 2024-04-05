const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");
const gravatar = require("gravatar");
const sendEmail = require("../service/mail-service");
// const mailService = require("../service/mail-service");
const tokenService = require("../service/token-service");
// const crypto = require("node:crypto");
const uuid = require("uuid");
const UserDto = require("../dtos/user-dtos");

const Joi = require("joi");
const userModel = require("../models/user-model");
// const { UUID } = require("mongodb");
// const { token } = require("morgan");

const userSchema = Joi.object({
  name: Joi.string().min(3).max(30),
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
    const activationLink = uuid.v4();
    const avatarURL = gravatar.url(email);

    const result = await User.create({
      name,
      email,
      password: passwordHash,
      avatarURL,
      activationLink,
    });
    // text: `To confirm your registration please click on the <a href="https://back-vinyl-records.onrender.com/auth/verify/">link</a>`,

    await sendEmail({
      to: email,
      subject: "VinylRecords confirmation",
      html: `
      <div style="font-family: Arial, sans-serif; text-align: center;">
      <div style="margin-bottom: 20px;">
        <h2>Congrats!</h2>
        <p>Great news - your registration on VinylRecords is complete!</p>
        <p>To finish up and start exploring, just click the button below.</p>
        <p>Remember, our community is all about sharing your favorite vinyl records and finding new music!</p>
        <p>We're excited to have you join us!</p>
        <p>Best,<br/>The VinylRecords Team</p>
        <a href="http://localhost:3000/auth/activate/${activationLink}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; font-weight: bold;">Confirm Registration</a>
      </div>
    </div>
      `,
    });

    const userDto = new UserDto(result);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).send({
      user: {
        name,
        email: result.email,
        avatarURL: result.avatarURL,
      },
      ...tokens,
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
    let user = await User.findOne({ email });
    await User.findByIdAndUpdate(user._id, { isLoggedIn: true });
    if (!user) {
      return res.status(401).send({ message: "User is not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send({ message: "Email or password is wrong" });
    }

    if (!user.isActivated) {
      return res.status(401).send({ message: "Your account is not verified" });
    }

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });

    return res.status(201).send({
      user: userDto,
      ...tokens,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res, next) {
  try {
    const { email } = req.body;
    const { refreshToken } = req.cookies;
    const token = await tokenService.removeToken(refreshToken);
    let user = await User.findOne({ email });
    await User.findByIdAndUpdate(user._id, { isLoggedIn: false });
    res.clearCookie("refreshToken");
    return res.json(token);
  } catch (error) {
    next(error);
  }
}

// async function resendVerify(req, res, next) {
//   const { email } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).send({ message: "User not found" });
//     }
//     if (user.verify) {
//       return res
//         .status(400)
//         .send({ message: "Verification has already been passed" });
//     }
//     await sendEmail({
//       to: "anton12vasyliev@gmail.com",
//       from: "anton12vasyliev@gmail.com",
//       subject: "Hello bulo4ka",
//       html: `To confirm your registration please click on the <a href="https://back-vinyl-records.onrender.com/auth/verify/${verifyToken}">link</a>`,
//       text: `To confirm your registration please click on the <a href="https://back-vinyl-records.onrender.com/auth/verify/${verifyToken}">link</a>`,
//     });
//     return res.status(200).send({ message: "Verification email sent" });
//   } catch (error) {
//     next(error);
//   }
// }
// не оновлюється кукі при рефреш
async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(404).send({ message: "User not authorized 1" });
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    // const tokenFromDb = await tokenModel.findOne({ refreshToken });
    if (!userData || !tokenFromDb) {
      console.log(tokenFromDb);
      res.status(404).send({ message: "User not authorized 2" });
    }
    const user = await userModel.findById(userData.id);
    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);
    res.cookie("refreshToken", tokens.refreshToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    return res.status(201).send({
      user: userDto,
      ...tokens,
    });
  } catch (error) {}
}

async function activate(req, res, next) {
  try {
    const activationLink = req.params.link;
    const user = await User.findOne({ activationLink });
    if (!user) {
      console.log("No user found with the activation link:", activationLink);
      return;
    }

    user.isActivated = true;
    await user.save();
    res.redirect(process.env.CLIENT_URL);
  } catch (error) {}
}

module.exports = {
  register,
  login,
  logout,
  // current,
  // verify,
  // resendVerify,
  refresh,
  activate,
};
