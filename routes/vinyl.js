const express = require("express");

const VinylController = require("../controllers/vinyl");

const router = express.Router();
const jsonParser = express.json();

router.get("/", VinylController.getVinyls);

router.get("/:id", VinylController.getVinyl);

router.post("/", jsonParser, VinylController.createVinyl);

router.delete("/:id", VinylController.deleteVinyl);

router.put("/:id", jsonParser, VinylController.updateVinyl);

router.patch("/:id/favorite", jsonParser, VinylController.updateStatusVinyl);

module.exports = router;
