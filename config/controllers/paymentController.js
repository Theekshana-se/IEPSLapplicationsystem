const Member = require("../models/Member");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const { createStoredFileRecord, normalizeStoredPath } = require("../utils/fileStorage");
const {
  sendPaymentReceivedEmail,
  sendPaymentVerifiedEmail,
  sendRenewalReminderEmail,
} = require("../utils/emailService");
const {
  buildRenewalOverview,
  summarizeMemberPayments,
} = require("../utils/paymentTracking");

function serializePayment(payment) {
  const plain =
    typeof payment.toObject === "function" ? payment.toObject() : { ...payment };

  if (plain.paymentProof) {
    plain.paymentProof = normalizeStoredPath(plain.paymentProof);
  }

  if (plain.paymentProofDetails?.path) {
    plain.paymentProofDetails = {
      ...plain.paymentProofDetails,
      path: normalizeStoredPath(plain.paymentProofDetails.path),
    };
  }

  return plain;
}

exports.getPaymentSummary = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const payments = await Payment.find().lean();
    const overview = await buildRenewalOverview(year);

    const totalReceived = payments
      .filter((payment) => payment.paymentStatus === "completed")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);

    const pendingVerifications = payments.filter(
      (payment) => payment.paymentStatus === "pending"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        year,
        totalPayments: payments.length,
        totalReceived,
        pendingVerifications,
        currentYearCompleted: overview.completedCount,
        membersDueThisYear: overview.dueMembers.length,
        dueMembers: overview.dueMembers,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getPayments = async (req, res, next) => {
  try {
    const { status = "", year = "", search = "" } = req.query;
    const query = {};

    if (status) {
      query.paymentStatus = status;
    }

    if (year) {
      query.paymentYear = Number(year);
    }

    const payments = await Payment.find(query)
      .populate("memberId", "membershipId personalDetails.nameWithInitials personalDetails.fullName personalDetails.personalEmail")
      .sort({ createdAt: -1 });

    const filteredPayments = payments.filter((payment) => {
      if (!search) {
        return true;
      }

      const haystack = [
        payment.membershipId,
        payment.memberId?.personalDetails?.nameWithInitials,
        payment.memberId?.personalDetails?.fullName,
        payment.memberId?.personalDetails?.personalEmail,
        payment.receiptNumber,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(search.toLowerCase());
    });

    res.status(200).json({
      success: true,
      data: filteredPayments.map(serializePayment),
    });
  } catch (error) {
    next(error);
  }
};

exports.recordPayment = async (req, res, next) => {
  try {
    const member = await Member.findById(req.body.memberId);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    const paymentProof = req.file ? await createStoredFileRecord(req.file) : null;
    const paymentYear = req.body.paymentYear ? Number(req.body.paymentYear) : undefined;
    const amount = Number(req.body.amount);

    const payment = await Payment.create({
      memberId: member._id,
      membershipId: member.membershipId || req.body.membershipId || "N/A",
      paymentType: req.body.paymentType || "annual",
      amount,
      paymentYear,
      dueDate: paymentYear ? new Date(`${paymentYear}-12-31T00:00:00.000Z`) : undefined,
      currency: req.body.currency || "LKR",
      paymentMethod: req.body.paymentMethod || "bank_transfer",
      paymentStatus: req.body.paymentStatus || "pending",
      transactionId: req.body.transactionId || "",
      receiptNumber: req.body.receiptNumber || "",
      paymentProof: paymentProof?.path || "",
      paymentProofDetails: paymentProof || undefined,
      paidAt: req.body.paidAt ? new Date(req.body.paidAt) : new Date(),
      recordedBy: req.user._id,
      notes: req.body.notes || "",
    });

    await Notification.create({
      recipientId: member._id,
      recipientType: "member",
      type: "payment_received",
      title: "Payment Received",
      message: `Your payment of LKR ${amount} has been recorded and is awaiting verification.`,
      metadata: {
        paymentId: payment._id,
        paymentYear,
      },
    });

    if (
      member.personalDetails?.personalEmail &&
      !member.personalDetails.personalEmail.endsWith("@iepsl.local")
    ) {
      sendPaymentReceivedEmail(
        member.personalDetails.personalEmail,
        member.personalDetails.nameWithInitials,
        amount,
        payment.receiptNumber || payment.transactionId || "Pending"
      ).catch((error) => console.error("Error sending payment received email:", error));
    }

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      data: serializePayment(payment),
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.paymentStatus = req.body.paymentStatus || "completed";
    payment.verifiedBy = req.user._id;
    payment.verifiedAt = new Date();
    payment.verificationNotes = req.body.verificationNotes || "";

    if (payment.paymentStatus === "completed" && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    await payment.save();

    const member = await Member.findById(payment.memberId);

    if (member) {
      await Notification.create({
        recipientId: member._id,
        recipientType: "member",
        type: "payment_verified",
        title: "Payment Verified",
        message: `Your payment for ${payment.paymentYear || "the membership renewal"} has been verified.`,
        metadata: {
          paymentId: payment._id,
          paymentYear: payment.paymentYear,
        },
      });

      if (
        member.personalDetails?.personalEmail &&
        !member.personalDetails.personalEmail.endsWith("@iepsl.local")
      ) {
        sendPaymentVerifiedEmail(
          member.personalDetails.personalEmail,
          member.personalDetails.nameWithInitials,
          payment.amount,
          payment.paymentYear
        ).catch((error) => console.error("Error sending payment verified email:", error));
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      data: serializePayment(payment),
    });
  } catch (error) {
    next(error);
  }
};

exports.sendRenewalReminders = async (req, res, next) => {
  try {
    const year = Number(req.body.year) || new Date().getFullYear();
    const overview = await buildRenewalOverview(year);
    let emailCount = 0;

    for (const dueMember of overview.dueMembers) {
      await Notification.create({
        recipientId: dueMember._id,
        recipientType: "member",
        type: "renewal_reminder",
        title: `Annual Membership Renewal Reminder - ${year}`,
        message: `Your IEPSL annual membership payment for ${year} is still pending.`,
        metadata: {
          year,
          status: dueMember.currentYearStatus,
        },
      });

      if (dueMember.email && !dueMember.email.endsWith("@iepsl.local")) {
        sendRenewalReminderEmail(dueMember.email, dueMember.name, year).catch((error) =>
          console.error("Error sending renewal reminder email:", error)
        );
        emailCount += 1;
      }
    }

    res.status(200).json({
      success: true,
      message: `Renewal reminders queued for ${overview.dueMembers.length} members.`,
      data: {
        year,
        reminderCount: overview.dueMembers.length,
        emailCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getMemberPaymentOverview = async (memberId, year = new Date().getFullYear()) => {
  const member = await Member.findById(memberId).lean();
  const payments = await Payment.find({ memberId }).lean();

  return {
    member,
    summary: summarizeMemberPayments(member, payments, year),
    payments: payments.map(serializePayment),
  };
};
