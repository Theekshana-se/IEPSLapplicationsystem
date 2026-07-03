const Member = require("../models/Member");
const Payment = require("../models/Payment");

function parseYear(value) {
  if (!value) {
    return null;
  }

  const match = String(value).match(/\b(20\d{2}|19\d{2})\b/);
  return match ? Number(match[0]) : null;
}

function getLegacyPaymentNoteStatus(note) {
  const normalized = String(note || "").trim().toLowerCase();

  if (!normalized) {
    return "missing";
  }

  if (["n", "no", "na", "not paid"].includes(normalized)) {
    return "missing";
  }

  if (
    normalized === "p" ||
    normalized === "p?" ||
    normalized.includes("pending") ||
    normalized.includes("will send receipt")
  ) {
    return "pending";
  }

  return "completed";
}

function getLegacyPaymentStatusMap(member) {
  const map = new Map();
  const paymentHistory = member?.legacyImport?.paymentHistory || {};

  for (const [columnName, note] of Object.entries(paymentHistory)) {
    const year = parseYear(columnName);
    if (!year) {
      continue;
    }

    map.set(year, getLegacyPaymentNoteStatus(note));
  }

  return map;
}

function getMemberStartYear(member) {
  const legacyYear = parseYear(member?.legacyImport?.rawRow?.["Member from (year)"]);
  if (legacyYear) {
    return legacyYear;
  }

  const createdAtYear = member?.createdAt ? new Date(member.createdAt).getFullYear() : null;
  return createdAtYear || new Date().getFullYear();
}

function summarizeMemberPayments(member, payments = [], year = new Date().getFullYear()) {
  const completedYears = new Set();
  const pendingYears = new Set();

  for (const payment of payments) {
    const paymentYear =
      payment.paymentYear ||
      (payment.paidAt ? new Date(payment.paidAt).getFullYear() : null) ||
      (payment.dueDate ? new Date(payment.dueDate).getFullYear() : null);

    if (!paymentYear) {
      continue;
    }

    if (payment.paymentStatus === "completed") {
      completedYears.add(paymentYear);
      pendingYears.delete(paymentYear);
    } else if (payment.paymentStatus === "pending" && !completedYears.has(paymentYear)) {
      pendingYears.add(paymentYear);
    }
  }

  for (const [legacyYear, status] of getLegacyPaymentStatusMap(member).entries()) {
    if (status === "completed" && !pendingYears.has(legacyYear)) {
      completedYears.add(legacyYear);
    }

    if (status === "pending" && !completedYears.has(legacyYear)) {
      pendingYears.add(legacyYear);
    }
  }

  const currentYearStatus = completedYears.has(year)
    ? "completed"
    : pendingYears.has(year)
      ? "pending"
      : "due";

  const latestPaidYear =
    completedYears.size > 0 ? Math.max(...Array.from(completedYears.values())) : null;

  return {
    currentYear: year,
    currentYearStatus,
    currentYearPaid: currentYearStatus === "completed",
    latestPaidYear,
    paidYears: Array.from(completedYears.values()).sort((a, b) => b - a),
    pendingYears: Array.from(pendingYears.values()).sort((a, b) => b - a),
    expectedFromYear: getMemberStartYear(member),
  };
}

async function buildRenewalOverview(year = new Date().getFullYear()) {
  const members = await Member.find({
    status: { $in: ["approved", "active"] },
  }).lean();

  const payments = await Payment.find({
    paymentType: { $in: ["annual", "renewal"] },
  }).lean();

  const paymentsByMemberId = new Map();

  for (const payment of payments) {
    const memberId = String(payment.memberId);
    if (!paymentsByMemberId.has(memberId)) {
      paymentsByMemberId.set(memberId, []);
    }
    paymentsByMemberId.get(memberId).push(payment);
  }

  const dueMembers = [];
  let completedCount = 0;
  let pendingVerificationCount = 0;

  for (const member of members) {
    const summary = summarizeMemberPayments(
      member,
      paymentsByMemberId.get(String(member._id)) || [],
      year
    );

    if (summary.currentYearStatus === "completed") {
      completedCount += 1;
      continue;
    }

    if (summary.currentYearStatus === "pending") {
      pendingVerificationCount += 1;
    }

    dueMembers.push({
      _id: member._id,
      membershipId: member.membershipId,
      name: member.personalDetails?.nameWithInitials || member.personalDetails?.fullName,
      fullName: member.personalDetails?.fullName,
      email: member.personalDetails?.personalEmail,
      district: member.personalDetails?.district,
      currentYearStatus: summary.currentYearStatus,
      latestPaidYear: summary.latestPaidYear,
      paymentSummary: summary,
    });
  }

  dueMembers.sort((a, b) => {
    if (a.currentYearStatus === b.currentYearStatus) {
      return (a.name || "").localeCompare(b.name || "");
    }

    return a.currentYearStatus === "pending" ? -1 : 1;
  });

  return {
    year,
    totalTrackedMembers: members.length,
    completedCount,
    pendingVerificationCount,
    dueMembers,
  };
}

module.exports = {
  getLegacyPaymentNoteStatus,
  summarizeMemberPayments,
  buildRenewalOverview,
};
