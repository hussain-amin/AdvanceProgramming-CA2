import React from 'react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  confirmColor = 'indigo', // indigo, green, red, amber
  children, // Optional custom content (e.g., files list)
  isLoading = false,
  showInput = false, // Show textarea for input
  inputPlaceholder = 'Enter reason...',
  inputValue = '',
  onInputChange = () => {}
}) => {
  if (!isOpen) return null;

  const getConfirmButtonStyles = () => {
    switch (confirmColor) {
      case 'green':
        return 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500';
      case 'red':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
      case 'amber':
        return 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500';
      default:
        return 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500';
    }
  };

  const getIconStyles = () => {
    switch (confirmColor) {
      case 'green':
        return { bg: 'bg-emerald-100', icon: 'text-emerald-600' };
      case 'red':
        return { bg: 'bg-red-100', icon: 'text-red-600' };
      case 'amber':
        return { bg: 'bg-amber-100', icon: 'text-amber-600' };
      default:
        return { bg: 'bg-indigo-100', icon: 'text-indigo-600' };
    }
  };

  const iconStyles = getIconStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all w-full max-w-md">
          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full ${iconStyles.bg} flex items-center justify-center`}>
                {confirmColor === 'red' ? (
                  <svg className={`w-6 h-6 ${iconStyles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                ) : confirmColor === 'green' ? (
                  <svg className={`w-6 h-6 ${iconStyles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : confirmColor === 'amber' ? (
                  <svg className={`w-6 h-6 ${iconStyles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ) : (
                  <svg className={`w-6 h-6 ${iconStyles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              
              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {message}
                </p>
              </div>
            </div>
            
            {/* Input Field for Reason */}
            {showInput && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reason for Rejection
                </label>
                <textarea
                  value={inputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  placeholder={inputPlaceholder}
                  rows="3"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-slate-500 mt-1">This reason will be visible to the member.</p>
              </div>
            )}

            {/* Custom Content (e.g., files list) */}
            {children && (
              <div className="mt-4">
                {children}
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(inputValue);
                onClose();
              }}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 ${getConfirmButtonStyles()}`}
            >
              {isLoading ? 'Loading...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
