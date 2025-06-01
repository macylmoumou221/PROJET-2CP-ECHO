"use client"

import { useState, useEffect } from "react"
import "./ReportDialog.css"

const ReportDialog = ({ isOpen, onClose, onSubmit, postId }) => {
  const [reportReason, setReportReason] = useState("")

  // Add this useEffect to attach the dialog to window object
  useEffect(() => {
    // Store old handler if it exists
    const oldHandler = window.openReportDialog;
    
    // Create new handler that manages dialog state
    window.openReportDialog = (postId, callback) => {
      setReportReason("");
      onSubmit = callback; // Store callback for later use
      // Use existing onClose and isOpen props
    };

    // Cleanup
    return () => {
      window.openReportDialog = oldHandler;
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(postId, reportReason)
    setReportReason("")
  }

  if (!isOpen) return null

  return (
    <>
      {/* This is the overlay that will be blurred */}
      <div className="report-overlay" onClick={onClose}></div>

      {/* This is the actual dialog that will NOT be blurred */}
      <div className="report-dialog">
        <div className="report-dialog-header">
          <h3>Signaler cette publication</h3>
          <button className="close-dialog" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="report-dialog-content">
            <label htmlFor="report-reason">Entrer la raison du signalement:</label>
            <textarea
              id="report-reason"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Décrivez pourquoi vous signalez cette publication..."
              required
            />
          </div>
          <div className="report-dialog-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="submit-button">
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

export default ReportDialog
