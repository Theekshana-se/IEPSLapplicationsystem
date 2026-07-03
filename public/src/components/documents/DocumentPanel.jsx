import React from 'react';
import { ExternalLink, FileText, Image as ImageIcon, User } from 'lucide-react';
import { getAssetUrl } from '../../utils/helpers';

function DocumentLink({ label, path, detail }) {
    if (!path) {
        return (
            <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                {label} not uploaded
            </div>
        );
    }

    return (
        <a
            href={getAssetUrl(path)}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-primary-400 hover:bg-primary-50 transition-colors"
        >
            <div className="min-w-0">
                <p className="font-medium text-gray-900">{label}</p>
                <p className="text-sm text-gray-500 truncate">
                    {detail?.originalName || path.split('/').pop()}
                </p>
            </div>
            <ExternalLink className="w-4 h-4 text-primary-600 flex-shrink-0" />
        </a>
    );
}

export default function DocumentPanel({
    documents = {},
    documentDetails = {},
    title = 'Documents',
    showProfilePreview = true
}) {
    const degreeCertificates = Array.isArray(documents.degreeCertificates)
        ? documents.degreeCertificates
        : [];
    const degreeCertificateDetails = Array.isArray(documentDetails.degreeCertificates)
        ? documentDetails.degreeCertificates
        : [];

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="text-xl font-semibold">{title}</h3>
            </div>
            <div className="card-body space-y-6">
                {showProfilePreview && (
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-50 border border-primary-100 flex items-center justify-center">
                            {documents.profilePhoto ? (
                                <img
                                    src={getAssetUrl(documents.profilePhoto)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-10 h-10 text-primary-500" />
                            )}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Profile Photo</p>
                            <p className="text-sm text-gray-500">
                                {documentDetails.profilePhoto?.originalName || 'No profile image uploaded yet'}
                            </p>
                            {documents.profilePhoto && (
                                <a
                                    href={getAssetUrl(documents.profilePhoto)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-2 mt-2 text-sm text-primary-600 hover:text-primary-700"
                                >
                                    <ImageIcon className="w-4 h-4" />
                                    View full image
                                </a>
                            )}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentLink
                        label="NIC Copy"
                        path={documents.nicCopy}
                        detail={documentDetails.nicCopy}
                    />
                    <DocumentLink
                        label="CV / Resume"
                        path={documents.cvDocument}
                        detail={documentDetails.cvDocument}
                    />
                </div>

                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-primary-600" />
                        <p className="font-medium text-gray-900">Degree Certificates</p>
                    </div>

                    {degreeCertificates.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {degreeCertificates.map((filePath, index) => (
                                <DocumentLink
                                    key={`${filePath}-${index}`}
                                    label={`Degree Certificate ${index + 1}`}
                                    path={filePath}
                                    detail={degreeCertificateDetails[index]}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500">
                            No degree certificates uploaded
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
