const express = require("express");

const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const {
  uploadRegistrationDocuments,
  uploadPaymentProof,
  handleUploadError,
} = require("../middleware/uploadMiddleware");
const {
  updateMyDocuments,
  getMyNotifications,
  markMyNotificationRead,
  getMyPayments,
} = require("../controllers/memberPortalController");
const { recordMyPayment } = require("../controllers/paymentController");
const { submitMyUpdateRequest, getMyUpdateRequests } = require("../controllers/managementController");

router.use(protect);

router.post("/documents", uploadRegistrationDocuments, handleUploadError, updateMyDocuments);
router.get("/notifications", getMyNotifications);
router.put("/notifications/:notificationId/read", markMyNotificationRead);
router.get("/payments", getMyPayments);
router.post("/payments", uploadPaymentProof, handleUploadError, recordMyPayment);
router.get("/profile-update-requests", getMyUpdateRequests);
router.post("/profile-update-requests", submitMyUpdateRequest);

module.exports = router;
