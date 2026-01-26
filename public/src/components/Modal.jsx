import React from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, type = 'default', actions, maxWidth = 'max-w-md' }) {
    if (!isOpen) return null;

    const icons = {
        success: <CheckCircle className="w-12 h-12 text-green-600" />,
        warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
        error: <AlertTriangle className="w-12 h-12 text-red-600" />,
        info: <Info className="w-12 h-12 text-blue-600" />,
        default: null
    };

    const bgColors = {
        success: 'bg-green-50',
        warning: 'bg-yellow-50',
        error: 'bg-red-50',
        info: 'bg-blue-50',
        default: 'bg-gray-50'
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
            <div className={`bg-white rounded-xl ${maxWidth} w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200`}>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                )}

                {type !== 'default' && (
                    <div className="flex justify-center mb-4">
                        <div className={`p-4 rounded-full ${bgColors[type]}`}>
                            {icons[type]}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    {title && <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>}
                    <div className="text-gray-600 mb-6">
                        {children}
                    </div>
                </div>

                {actions && (
                    <div className="flex justify-center gap-3 pt-2">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    );
}
