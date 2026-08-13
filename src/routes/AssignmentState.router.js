const {Router} = require("express");
const { createAssignmentState } = require("../controllers/AssignementState.controller");

const router = Router();

router.post("/create", createAssignmentState);

module.exports = router;
