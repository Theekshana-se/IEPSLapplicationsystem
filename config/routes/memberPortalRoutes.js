const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  uploadRegistrationDocuments,
  handleUploadError,
} = require("../middleware/uploadMiddleware");
const {
  updateMyDocuments,
  getMyNotifications,
  markMyNotificationRead,
  getMyPayments,
} = require("../controllers/memberPortalController");

router.use(protect);

router.post("/documents", uploadRegistrationDocuments, handleUploadError, updateMyDocuments);
router.get("/notifications", getMyNotifications);
router.put("/notifications/:notificationId/read", markMyNotificationRead);
router.get("/payments", getMyPayments);

module.exports = router;
