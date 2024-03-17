const fs = require("node:fs/promises");
const path = require("node:path");
const Jimp = require("jimp");

const User = require("../models/user");

const avatarsDir = path.join(__dirname, "../", "public", "avatars");

async function uploadAvatar(req, res, next) {
  const { path: tempUpload } = req.file;

  const avatar = await Jimp.read(tempUpload);
  avatar.resize(250, 250).quality(60).write(path.join(tempUpload));
  try {
    const { id } = req.user;
    const { path: tempUpload, originalname } = req.file;
    const fileName = `${id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);
    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", fileName);
    await User.findByIdAndUpdate(id, { avatarURL });
    res.send({ avatarURL });
  } catch (error) {
    next(error);
  }
}

module.exports = { uploadAvatar };
