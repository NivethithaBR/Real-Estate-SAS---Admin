const express = require("express");
const { createTeam, deleteTeam, getTeam, updatedTeam, searchTeam, getAll } = require("../controllers/Team.controller");

const router = express.Router();

router.post("/create", createTeam);
router.put("/update/:id", updatedTeam);
router.get("/get/:id", getTeam);
router.delete("/delete/:id", deleteTeam);
router.get("/search", searchTeam);
router.get("/getAll", getAll);

module.exports = router;
