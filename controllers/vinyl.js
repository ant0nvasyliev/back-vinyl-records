const { v4: uuidv4 } = require("uuid");
const Joi = require("joi");

const mongoose = require("mongoose");

const VinylSchema = Joi.object({
  name: Joi.string().min(2).max(30),
  email: Joi.string().email(),
  phone: Joi.string().min(6).max(18),
  favorite: Joi.boolean(),
});
const Vinyl = require("../models/vinyl");

async function getVinyls(req, res, next) {
  try {
    const userId = req.user.id;
    const Vinyls = await Vinyl.find({ ownerId: userId });
    res.send(Vinyls).status(200);
  } catch (error) {
    next(error);
  }
}

async function getVinyl(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid ID" });
    }

    const Vinyl = await Vinyl.findById(id);

    if (!Vinyl) {
      return res.status(404).send({ message: "Not found" });
    }

    if (Vinyl.ownerId.toString() !== userId) {
      return res.status(404).send({ message: "Not found" });
    }

    res.status(200).send(Vinyl);
  } catch (error) {
    next(error);
  }
}

async function createVinyl(req, res, next) {
  try {
    const validation = VinylSchema.validate(req.body);
    if (validation.error) {
      return res.status(400).send(validation.error.message);
    }
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).send({ message: "Missing fields" });
    }
    const Vinyl = {
      id: uuidv4(),
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      favorite: req.body.favorite,
      ownerId: req.user.id,
    };

    const result = await Vinyl.create(Vinyl);
    res.status(201).send(result);
  } catch (error) {
    // res.status(400).send({ message: "Missing body" });
  }
}

async function deleteVinyl(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID" });
  }

  try {
    const result = await Vinyl.findByIdAndDelete(id);
    if (result === null) {
      return res.status(404).send({ message: "Not found" });
    }
    if (result.ownerId.toString() !== userId) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send(`Deleted Vinyl id: ${id}`);
  } catch (error) {
    next(error);
  }
}

async function updateVinyl(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID" });
  }

  try {
    const validation = VinylSchema.validate(req.body);

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).send({ message: "missing fields" });
    }

    if (validation.error) {
      return res.status(400).send(validation.error.message);
    }

    const Vinyl = {
      id: req.body.id,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      favorite: req.body.favorite,
    };

    const result = await Vinyl.findByIdAndUpdate(id, Vinyl, { new: true });
    if (result === null) {
      return res.status(404).send({ message: "Not found" });
    }
    if (result.ownerId.toString() !== userId) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send(result).status(200);
  } catch (error) {
    next(error);
  }
}

async function updateStatusVinyl(req, res, next) {
  const { id } = req.params;
  const userId = req.user.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid ID" });
  }
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).send("message: missing field favorite");
  }
  try {
    const result = await Vinyl.findByIdAndUpdate(
      id,
      { favorite: req.body.favorite },
      { new: true }
    );
    if (result === null) {
      return res.status(404).send("Vinyl not found");
    }
    if (result.ownerId.toString() !== userId) {
      return res.status(404).send({ message: "Not found" });
    }
    res.send(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getVinyls,
  getVinyl,
  createVinyl,
  deleteVinyl,
  updateVinyl,
  updateStatusVinyl,
};
