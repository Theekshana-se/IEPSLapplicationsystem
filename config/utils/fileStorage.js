const fs = require("fs");
const path = require("path");

const contentRoot = path.resolve(
  __dirname,
  "..",
  process.env.CONTENT_PATH || process.env.UPLOAD_PATH || "../content"
);

function ensureDirectory(directoryPath) {
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
  }
}

ensureDirectory(contentRoot);

function getFolderForField(fieldName) {
  switch (fieldName) {
    case "profilePhoto":
      return "profile-photos";
    case "paymentProof":
      return "payment-proofs";
    default:
      return "documents";
  }
}

function getDestinationForField(fieldName) {
  const directoryPath = path.join(contentRoot, getFolderForField(fieldName));
  ensureDirectory(directoryPath);
  return directoryPath;
}

function sanitizeFileBaseName(fileName) {
  const extension = path.extname(fileName);
  const baseName = path.basename(fileName, extension);

  return baseName
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildStoredFilename(file) {
  const extension = path.extname(file.originalname).toLowerCase();
  const safeBaseName = sanitizeFileBaseName(file.originalname) || file.fieldname;
  return `${safeBaseName}-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
}

function normalizeStoredPath(value) {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(normalizeStoredPath);
  }

  const normalized = String(value).replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (normalized.startsWith("/content/")) {
    return normalized;
  }

  if (normalized.startsWith("content/")) {
    return `/${normalized}`;
  }

  if (normalized.startsWith("/uploads/")) {
    return normalized;
  }

  if (normalized.startsWith("uploads/")) {
    return `/${normalized}`;
  }

  const uploadsIndex = normalized.toLowerCase().indexOf("/uploads/");
  if (uploadsIndex >= 0) {
    return normalized.slice(uploadsIndex);
  }

  return normalized;
}

function toPublicContentPath(filePath) {
  if (!filePath) {
    return filePath;
  }

  const relativePath = path.relative(contentRoot, filePath).replace(/\\/g, "/");

  if (!relativePath || relativePath.startsWith("..")) {
    return normalizeStoredPath(filePath);
  }

  return `/content/${relativePath}`;
}

function buildStoredFileRecord(file, overrides = {}) {
  return {
    path: file.path ? toPublicContentPath(file.path) : "",
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    bytes: file.size,
    provider: "local",
    publicId: "",
    assetId: "",
    resourceType: file.mimetype?.startsWith("image/") ? "image" : "raw",
    format: path.extname(file.originalname).replace(/^\./, "").toLowerCase(),
    uploadedAt: new Date(),
    ...overrides,
  };
}

async function createStoredFileRecord(file) {
  if (!file) {
    return null;
  }

  return buildStoredFileRecord(file);
}

function normalizeDocumentCollection(documents = {}, documentDetails = {}) {
  return {
    documents: {
      profilePhoto: normalizeStoredPath(documents.profilePhoto) || "",
      nicCopy: normalizeStoredPath(documents.nicCopy) || "",
      cvDocument: normalizeStoredPath(documents.cvDocument) || "",
      degreeCertificates: Array.isArray(documents.degreeCertificates)
        ? documents.degreeCertificates.map(normalizeStoredPath)
        : [],
    },
    documentDetails: {
      profilePhoto: documentDetails.profilePhoto
        ? { ...documentDetails.profilePhoto, path: normalizeStoredPath(documentDetails.profilePhoto.path) }
        : null,
      nicCopy: documentDetails.nicCopy
        ? { ...documentDetails.nicCopy, path: normalizeStoredPath(documentDetails.nicCopy.path) }
        : null,
      cvDocument: documentDetails.cvDocument
        ? { ...documentDetails.cvDocument, path: normalizeStoredPath(documentDetails.cvDocument.path) }
        : null,
      degreeCertificates: Array.isArray(documentDetails.degreeCertificates)
        ? documentDetails.degreeCertificates.map((file) => ({
            ...file,
            path: normalizeStoredPath(file.path),
          }))
        : [],
    },
  };
}

module.exports = {
  contentRoot,
  uploadsRoot: contentRoot,
  getDestinationForField,
  buildStoredFilename,
  createStoredFileRecord,
  normalizeStoredPath,
  normalizeDocumentCollection,
};
