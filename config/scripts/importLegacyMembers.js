const path = require("path");
const crypto = require("crypto");
const { spawnSync } = require("child_process");

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

require("../config/env");

const Member = require("../models/Member");

const DEFAULT_SHEET = "Full Information";
const COMPLETED_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];

function parseArgs(argv) {
  const args = {};

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith("--")) {
      args[key] = true;
      continue;
    }

    args[key] = next;
    i += 1;
  }

  return args;
}

function cleanString(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\s+/g, " ").trim();
}

function cleanMultiline(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).replace(/\r/g, "").replace(/\n+/g, "\n").trim();
}

function sanitizeEmail(value) {
  const email = cleanString(value).toLowerCase();

  if (!email) {
    return "";
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function inferGender(prefix) {
  const normalized = cleanString(prefix).toLowerCase();

  if (normalized.includes("mrs") || normalized === "ms" || normalized === "ms.") {
    return "female";
  }

  if (normalized.includes("mr")) {
    return "male";
  }

  return "other";
}

function parseDate(value) {
  const text = cleanString(value);

  if (!text) {
    return null;
  }

  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseYear(value) {
  const text = cleanString(value);

  if (!text) {
    return null;
  }

  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function sanitizeToken(value) {
  const token = cleanString(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return token || "member";
}

function reserveUnique(baseValue, ownerKey, usedMap, fallbackFactory) {
  if (baseValue && (!usedMap.has(baseValue) || usedMap.get(baseValue) === ownerKey)) {
    usedMap.set(baseValue, ownerKey);
    return baseValue;
  }

  let counter = 1;
  let candidate = fallbackFactory(counter);

  while (usedMap.has(candidate) && usedMap.get(candidate) !== ownerKey) {
    counter += 1;
    candidate = fallbackFactory(counter);
  }

  usedMap.set(candidate, ownerKey);
  return candidate;
}

function buildPaymentHistory(row) {
  const paymentHistory = {};

  for (const [key, value] of Object.entries(row)) {
    if (!/^Paid/i.test(key)) {
      continue;
    }

    const note = cleanMultiline(value);
    if (note) {
      paymentHistory[key.trim()] = note;
    }
  }

  return paymentHistory;
}

function readWorkbookRows({ pythonPath, workbookPath, sheetName }) {
  const helperPath = path.join(__dirname, "readLegacyMembersWorkbook.py");
  const result = spawnSync(
    pythonPath,
    [helperPath, workbookPath, sheetName],
    {
      encoding: "utf8",
      maxBuffer: 20 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || "Failed to read workbook.");
  }

  return JSON.parse(result.stdout);
}

function buildMemberPayload(row, context) {
  const {
    rowNumber,
    existingMember,
    usedEmails,
    usedMembershipIds,
    adjustments,
    sourceFile,
    sourceSheet,
  } = context;

  const ownerKey = cleanString(row["ID Number"]);
  const originalMembershipNo = cleanString(row["Membership No."]);
  const previousMembershipNo = cleanString(row["Previous Membership Number "]);
  const originalEmail = sanitizeEmail(row[" Personal Email "]);
  const identifierToken = sanitizeToken(
    ownerKey || originalMembershipNo || previousMembershipNo || `row-${rowNumber}`
  );

  const membershipId = reserveUnique(
    originalMembershipNo,
    ownerKey,
    usedMembershipIds,
    (counter) => `${originalMembershipNo || "LEGACY"}-${counter}`
  );

  if (membershipId !== originalMembershipNo) {
    adjustments.membershipIds.push({
      rowNumber,
      nicNumber: ownerKey,
      originalMembershipNo,
      assignedMembershipId: membershipId,
    });
  }

  const personalEmail = reserveUnique(
    originalEmail,
    ownerKey,
    usedEmails,
    (counter) => `legacy+${identifierToken}${counter === 1 ? "" : `-${counter}`}@iepsl.local`
  );

  if (personalEmail !== originalEmail) {
    adjustments.emails.push({
      rowNumber,
      nicNumber: ownerKey,
      originalEmail: originalEmail || null,
      assignedEmail: personalEmail,
    });
  }

  const preferredCommunicationText = cleanString(
    row["Preferred contact method in future communications?"]
  ).toLowerCase();

  const preferredCommunication = {};
  if (preferredCommunicationText.includes("email")) {
    preferredCommunication.method = "email";
  } else if (preferredCommunicationText.includes("postal")) {
    preferredCommunication.method = "postal";
  }

  if (preferredCommunicationText.includes("office")) {
    preferredCommunication.location = "office";
  } else if (
    preferredCommunicationText.includes("residential") ||
    preferredCommunicationText.includes("home")
  ) {
    preferredCommunication.location = "residential";
  }

  const workExperience = [];
  const placeOfWork = cleanString(row["Work Place"]);
  const designation = cleanString(row["Current position"]);
  const natureOfWork = cleanString(row["Work field"]);

  if (placeOfWork || designation || natureOfWork) {
    workExperience.push({
      placeOfWork: placeOfWork || "Not specified",
      designation: designation || "Not specified",
      natureOfWork: natureOfWork || "Not specified",
      isCurrent: true,
    });
  }

  const memberSinceYear = parseYear(row["Member from (year)"]);
  const importedAt = new Date();
  const historicalDate = memberSinceYear
    ? new Date(`${memberSinceYear}-01-01T00:00:00.000Z`)
    : importedAt;

  return {
    membershipId,
    status: "active",
    personalDetails: {
      prefix: cleanString(row["Prefix"]),
      nameWithInitials: cleanString(row["Name with Initials "]) || cleanString(row["Full Name"]),
      fullName: cleanString(row["Full Name"]),
      dateOfBirth: parseDate(row["Date of birth"]) || historicalDate,
      nicNumber: ownerKey,
      nationality: "Sri Lankan",
      gender: inferGender(row["Prefix"]),
      district: cleanString(row["Province"]) || "Unknown",
      residentialAddress: cleanString(row["Address"]),
      mobileNumber: cleanMultiline(row[" Contact number (mobile)"]) || "Not provided",
      personalEmail,
    },
    officeDetails: {
      officePhone: cleanMultiline(row[" Contact number (office/residence)"]),
      preferredCommunication:
        Object.keys(preferredCommunication).length > 0 ? preferredCommunication : undefined,
    },
    workExperience,
    password: bcrypt.hashSync(crypto.randomBytes(18).toString("base64url"), 10),
    isEmailVerified: Boolean(originalEmail),
    registrationProgress: 100,
    currentStep: 8,
    completedSteps: COMPLETED_STEPS,
    submittedAt: historicalDate,
    reviewedAt: importedAt,
    reviewNotes: "Imported from the IEPSL legacy membership workbook.",
    declaration: {
      agreed: true,
      agreedDate: historicalDate,
      signature: "Legacy import",
    },
    legacyImport: {
      sourceFile,
      sourceSheet,
      rowNumber,
      importedAt,
      originalMembershipNo,
      previousMembershipNo,
      originalPersonalEmail: originalEmail || undefined,
      paymentHistory: buildPaymentHistory(row),
      rawRow: row,
    },
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const workbookPath = args.file;
  const pythonPath = args.python;
  const sheetName = args.sheet || DEFAULT_SHEET;

  if (!workbookPath) {
    throw new Error("Missing required argument: --file <path-to-xlsx>");
  }

  if (!pythonPath) {
    throw new Error("Missing required argument: --python <path-to-python>");
  }

  const rows = readWorkbookRows({ pythonPath, workbookPath, sheetName });
  const existingMembers = await Member.find(
    {},
    "membershipId personalDetails.personalEmail personalDetails.nicNumber legacyImport"
  ).lean();

  const usedEmails = new Map();
  const usedMembershipIds = new Map();

  for (const member of existingMembers) {
    const nicNumber = cleanString(member?.personalDetails?.nicNumber);
    const email = sanitizeEmail(member?.personalDetails?.personalEmail);
    const membershipId = cleanString(member?.membershipId);

    if (email) {
      usedEmails.set(email, nicNumber);
    }

    if (membershipId) {
      usedMembershipIds.set(membershipId, nicNumber);
    }
  }

  const adjustments = {
    emails: [],
    membershipIds: [],
  };

  let inserted = 0;
  let updated = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const nicNumber = cleanString(row["ID Number"]);

    if (!nicNumber) {
      throw new Error(`Row ${index + 2} is missing ID Number.`);
    }

    const existingMember = await Member.findOne({
      "personalDetails.nicNumber": nicNumber,
    });

    if (existingMember?.personalDetails?.personalEmail) {
      usedEmails.delete(existingMember.personalDetails.personalEmail.toLowerCase());
    }

    if (existingMember?.membershipId) {
      usedMembershipIds.delete(existingMember.membershipId);
    }

    const payload = buildMemberPayload(row, {
      rowNumber: index + 2,
      existingMember,
      usedEmails,
      usedMembershipIds,
      adjustments,
      sourceFile: path.basename(workbookPath),
      sourceSheet: sheetName,
    });

    if (existingMember) {
      existingMember.membershipId = payload.membershipId;
      existingMember.status = payload.status;
      existingMember.personalDetails = payload.personalDetails;
      existingMember.officeDetails = payload.officeDetails;
      existingMember.workExperience = payload.workExperience;
      existingMember.isEmailVerified = payload.isEmailVerified;
      existingMember.registrationProgress = payload.registrationProgress;
      existingMember.currentStep = payload.currentStep;
      existingMember.completedSteps = payload.completedSteps;
      existingMember.submittedAt = payload.submittedAt;
      existingMember.reviewedAt = payload.reviewedAt;
      existingMember.reviewNotes = payload.reviewNotes;
      existingMember.declaration = payload.declaration;
      existingMember.legacyImport = payload.legacyImport;

      await existingMember.save();
      updated += 1;
      continue;
    }

    await Member.create(payload);
    inserted += 1;
  }

  console.log(
    JSON.stringify(
      {
        workbook: path.basename(workbookPath),
        sheetName,
        rowsRead: rows.length,
        inserted,
        updated,
        emailAdjustments: adjustments.emails,
        membershipIdAdjustments: adjustments.membershipIds,
      },
      null,
      2
    )
  );
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(main)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect().catch(() => {});
  });
