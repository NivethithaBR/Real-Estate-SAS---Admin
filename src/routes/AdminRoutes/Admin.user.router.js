const { Router } = require("express")
const { createUser, deleteUser, search, getAllUsers, getUser, getAllUser } = require("../../controllers/authController");
const upload = require("../../middlewares/uploadMiddleware")
const { authenticateUser } = require("../../middlewares/authMiddleware");

const router = Router()

router.use(authenticateUser);
router.post("/create", upload.single("avatar"), createUser);
router.delete("/delete/:id", deleteUser);
router.get("/search", search);
router.get("/getAll", getAllUsers);
router.get("/getAlluser", getAllUser);
router.get("/get/:id", getUser);


module.exports = router