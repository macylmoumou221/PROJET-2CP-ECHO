import React, { createContext, useState, useContext } from 'react';
import ReportDialog from '../components/ReportDialog';

const ReportDialogContext = createContext();

export function ReportDialogProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [postId, setPostId] = useState(null);
  const [onSubmitCallback, setOnSubmitCallback] = useState(null);

  const openReportDialog = (id, callback) => {
    setPostId(id);
    setOnSubmitCallback(() => callback);
    setIsOpen(true);
  };

  const closeReportDialog = () => {
    setIsOpen(false);
    setPostId(null);
    setOnSubmitCallback(null);
  };

  const handleSubmit = (postId, reason) => {
    if (onSubmitCallback) {
      onSubmitCallback(reason);
    }
    closeReportDialog();
  };

  return (
    <ReportDialogContext.Provider value={{ openReportDialog, closeReportDialog }}>
      {children}
      <ReportDialog
        isOpen={isOpen}
        onClose={closeReportDialog}
        onSubmit={handleSubmit}
        postId={postId}
      />
    </ReportDialogContext.Provider>
  );
}

export function useReportDialog() {
  return useContext(ReportDialogContext);
}
