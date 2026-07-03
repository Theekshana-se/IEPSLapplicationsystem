const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const Member = require("../models/Member");
const { createStoredFileRecord } = require("../utils/fileStorage");
const { serializeMember } = require("../utils/serializeMember");
const { summarizeMemberPayments } = require("../utils/paymentTracking");

function ensureMemberAccess(req, res) {
  if (req.userType !== "member") {
    res.status(403).json({
      success: false,
      message: "Only members can access this route.",
    });
    return false;
  }

  return true;
}

exports.updateMyDocuments = async (req, res, next) => {
  try {
    if (!ensureMemberAccess(req, res)) {
      return;
    }

    const member = await Member.findById(req.user._id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const documents = {
      ...(member.documents || {}),
    };
    const documentDetails = {
      ...(member.documentDetails || {}),
    };

    if (req.files?.profilePhoto?.[0]) {
      const profilePhoto = await createStoredFileRecord(req.files.profilePhoto[0]);
      documents.profilePhoto = profilePhoto.path;
      documentDetails.profilePhoto = profilePhoto;
    }

    if (req.files?.nicCopy?.[0]) {
      const nicCopy = await createStoredFileRecord(req.files.nicCopy[0]);
      documents.nicCopy = nicCopy.path;
      documentDetails.nicCopy = nicCopy;
    }

    if (req.files?.cvDocument?.[0]) {
      const cvDocument = await createStoredFileRecord(req.files.cvDocument[0]);
      documents.cvDocument = cvDocument.path;
      documentDetails.cvDocument = cvDocument;
    }

    if (req.files?.degreeCertificates?.length) {
      const degreeCertificates = await Promise.all(
        req.files.degreeCertificates.map(createStoredFileRecord)
      );
      documents.degreeCertificates = degreeCertificates.map((file) => file.path);
      documentDetails.degreeCertificates = degreeCertificates;
    }

    member.documents = documents;
    member.documentDetails = documentDetails;
    await member.save();

    await Notification.create({
      recipientType: "admin",
      type: "document_uploaded",
      title: "Member Documents Updated",
      message: `${member.personalDetails.nameWithInitials} updated profile or verification documents.`,
      metadata: {
        memberId: member._id,
        memberName: member.personalDetails.nameWithInitials,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Documents updated successfully",
      data: {
        member: serializeMember(member),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyNotifications = async (req, res, next) => {
  try {
    if (!ensureMemberAccess(req, res)) {
      return;
    }

    const notifications = await Notification.find({
      recipientType: "member",
      recipientId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

exports.markMyNotificationRead = async (req, res, next) => {
  try {
    if (!ensureMemberAccess(req, res)) {
      return;
    }

    const notification = await Notification.findOne({
      _id: req.params.notificationId,
      recipientType: "member",
      recipientId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    if (!ensureMemberAccess(req, res)) {
      return;
    }

    const payments = await Payment.find({
      memberId: req.user._id,
    }).sort({ paymentYear: -1, createdAt: -1 });

    const paymentSummary = summarizeMemberPayments(req.user, payments);

    res.status(200).json({
      success: true,
      data: {
        summary: paymentSummary,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};
