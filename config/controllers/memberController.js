const Member = require("../models/Member");
const Notification = require("../models/Notification");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../utils/ApiError");
const { serializeMember, serializeMembers } = require("../utils/serializeMember");

exports.createMember = asyncHandler(async (req, res) => {
  const member = await Member.create(req.body);
  res.status(201).json({
    success: true,
    data: member,
  });
});

exports.getAllMembers = asyncHandler(async (req, res) => {
  const members = await Member.find();
  res.status(200).json({
    success: true,
    count: members.length,
    data: serializeMembers(members),
  });
});

exports.getMemberById = asyncHandler(async (req, res) => {
  const member = await Member.findById(req.params.id);

  if (!member) {
    throw new ApiError(404, "Member not found");
  }

  res.status(200).json({
    success: true,
    data: serializeMember(member),
  });
});

exports.searchMemberForReference = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new ApiError(400, "Search query is required");
  }

  // Search by membershipId (exact) or nicNumber (exact)
  // We prioritize privacy, so we might restrict to exact matches for ID/NIC
  // or allow name search if requested. The requirement said "search a existing memeber using id".

  const member = await Member.findOne({
    $or: [
      { membershipId: query },
      { "personalDetails.nicNumber": query }
    ],
    status: { $in: ["approved", "active"] } // Only approved members
  }).select(
    "personalDetails.nameWithInitials personalDetails.personalEmail personalDetails.mobileNumber workExperience membershipId"
  );

  if (!member) {
    return res.status(404).json({
      success: false,
      message: "Member not found or not active"
    });
  }

  // Extract latest designation/organization from work experience if available
  const currentWork = member.workExperience.find(w => w.isCurrent) || member.workExperience[0];

  res.status(200).json({
    success: true,
    data: {
      name: member.personalDetails.nameWithInitials,
      email: member.personalDetails.personalEmail,
      phone: member.personalDetails.mobileNumber,
      designation: currentWork ? currentWork.designation : "",
      organization: currentWork ? currentWork.placeOfWork : "",
      membershipId: member.membershipId
    }
  });
});
