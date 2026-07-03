const { normalizeDocumentCollection } = require("./fileStorage");

function serializeMember(member) {
  if (!member) {
    return member;
  }

  const plainMember =
    typeof member.toObject === "function"
      ? member.toObject({ virtuals: true })
      : { ...member };

  const { documents, documentDetails } = normalizeDocumentCollection(
    plainMember.documents,
    plainMember.documentDetails
  );

  return {
    ...plainMember,
    documents,
    documentDetails,
  };
}

function serializeMembers(members = []) {
  return members.map(serializeMember);
}

module.exports = {
  serializeMember,
  serializeMembers,
};
