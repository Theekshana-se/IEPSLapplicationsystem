const express = require("express");
const router = express.Router();

const {
  createMember,
  getAllMembers,
  getMemberById,
  searchMemberForReference
} = require("../controllers/memberController");

router.post("/", createMember);
router.get("/", getAllMembers);
router.get("/search/reference", searchMemberForReference);
router.get("/:id", getMemberById);

module.exports = router;
