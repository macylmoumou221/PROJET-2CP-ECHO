"use client"

import { useState, useEffect } from "react"
import "./Afficherreclamation.css"

const Afficherreclamation = ({
  claims,
  onSelectClaim,
  selectedClaim,
  showDetails,
  onCloseDetails,
  onUpdateStatus,
  userRole,
  teachers,
}) => {
  const [responseText, setResponseText] = useState("")
  const [newClaims, setNewClaims] = useState([])

  useEffect(() => {
    if (claims.length > 0) {
      const sortedClaims = [...claims].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      )
      
      const recentClaim = sortedClaims[0]
      const now = new Date()
      const claimDate = new Date(recentClaim.createdAt)
      const timeDiff = now - claimDate

      if (timeDiff < 24 * 60 * 60 * 1000 && recentClaim.status === "pending") {
        setNewClaims([recentClaim.id])
        const timer = setTimeout(() => setNewClaims([]), 10000)
        return () => clearTimeout(timer)
      }
    }
  }, [claims])

  // Simplified date formatting
  const formatDate = (dateString) => {
    try {
      // The date is already in the correct format from the server
      // Just display it as is without additional parsing
      return dateString;
    } catch (error) {
      console.error("Date formatting error:", error);
      return "Date invalide";
    }
  };

  // Get teacher name by ID
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find((t) => t.id === teacherId)
    return teacher ? teacher.name : "Enseignant inconnu"
  }

  // Get student full name from student object
  const getStudentName = (claim) => {
    // Debug logging
    console.log("Getting student name from claim:", claim);

    // Check for studentId object which contains the actual student data
    const studentData = claim.studentId || claim.student;
    
    if (!studentData) {
      console.log("No student data found");
      return "Étudiant inconnu";
    }

    console.log("Using student data:", studentData);

    const firstName = studentData.firstName;
    const lastName = studentData.lastName;

    if (!firstName || !lastName) {
      return studentData.username || "Étudiant inconnu";
    }

    return `${firstName} ${lastName}`;
  }

  // Handle status update with response
  const handleStatusUpdate = (claimId, newStatus) => {
    if (newStatus === "dealt" && responseText.trim() === "") {
      alert("Veuillez fournir une réponse avant de marquer comme traité.")
      return
    }

    onUpdateStatus(claimId, newStatus, responseText)
    setResponseText("")
  }

  // Translate status to French
  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "dealt":
        return "Traité"
      case "rejected":
        return "Rejeté"
      default:
        return status
    }
  }

  // If no claims, show empty state
  if (claims.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3 className="empty-state-text">Aucune réclamation trouvée</h3>
        <p className="empty-state-subtext">
          {userRole === "student"
            ? "Vous n'avez pas encore soumis de réclamation. Utilisez le bouton + pour en créer une nouvelle."
            : userRole === "teacher"
              ? "Vous n'avez pas encore reçu de réclamation."
              : "Aucune réclamation n'est disponible dans le système."}
        </p>
      </div>
    )
  }

  return (
    <div className="claims-wrapper">
      <div className="claims-list">
        {claims.map((claim) => {
          console.log("Processing claim:", claim);
          console.log("Claim student data:", claim.student);
          const dateToFormat = claim.date || claim.createdAt;
          const studentName = getStudentName(claim);
          
          return (
            <div
              key={claim.id}
              className={`claim-card ${claim.status} ${newClaims.includes(claim.id) ? "new" : ""}`}
              onClick={() => onSelectClaim(claim)}
            >
              <div className={`claim-status ${claim.status}`}>{translateStatus(claim.status)}</div>
              <h3 className="claim-title">{claim.title}</h3>
              <div className="claim-meta">
                <span>Soumis le {formatDate(dateToFormat)}</span>
                {claim.updatedAt && claim.status !== "pending" && (
                  <span className="text-sm text-gray-500 ml-2">
                    • {claim.status === "dealt" ? "Traité" : "Rejeté"} le {formatDate(claim.updatedAt)}
                  </span>
                )}
              </div>
              <p className="claim-description">{claim.description}</p>
              {userRole === "student" ? (
                <div className="claim-teacher">
                  À: {claim.teacherName || "Enseignant inconnu"}
                </div>
              ) : (
                <div className="claim-student">
                  De: {studentName}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showDetails && selectedClaim && (
        <div className="claim-details-overlay">
          <div className="claim-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="claim-details-close" onClick={onCloseDetails}>×</button>

            {/* Add debug logging */}
            {console.log("Selected claim details:", selectedClaim)}
            {console.log("Selected claim student:", selectedClaim.student)}

            <div className="claim-details-header">
              <h2 className="claim-details-title">{selectedClaim.title}</h2>
              <div className="claim-details-meta">
                <span className="claim-details-date">
                  Soumis le {formatDate(selectedClaim.date || selectedClaim.createdAt)}
                </span>
                <span className="claim-details-teacher">
                  Enseignant: {selectedClaim.teacherName || "Enseignant inconnu"}
                </span>
                <span className="claim-details-student">
                  Étudiant: {getStudentName(selectedClaim)}
                </span>
              </div>
              <div className={`claim-details-status-badge ${selectedClaim.status}`}>
                {translateStatus(selectedClaim.status)}
              </div>
              {selectedClaim.updatedAt && selectedClaim.status !== "pending" && (
                <div className="text-sm text-gray-500 mt-1">
                  {selectedClaim.status === "dealt" ? "Traité" : "Rejeté"} le {formatDate(selectedClaim.updatedAt)}
                </div>
              )}
            </div>

            <div className="claim-details-content">
              <div className="claim-details-description">{selectedClaim.description}</div>

              {selectedClaim.status !== "pending" && selectedClaim.response && (
                <div className="claim-details-response">
                  <h4 className="claim-details-response-title">Réponse:</h4>
                  <p className="claim-details-response-text">{selectedClaim.response}</p>
                </div>
              )}
            </div>

            {/* Action buttons for teachers */}
            {userRole === "teacher" && selectedClaim.status === "pending" && (
              <div>
                <div className="response-form">
                  <textarea
                    className="response-textarea"
                    placeholder="Écrivez votre réponse ici..."
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                  ></textarea>
                </div>

                <div className="claim-details-actions">
                  <button
                    className="claim-action-button reject"
                    onClick={() => handleStatusUpdate(selectedClaim.id, "rejected")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Rejeter
                  </button>

                  <button
                    className="claim-action-button deal"
                    onClick={() => handleStatusUpdate(selectedClaim.id, "dealt")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Marquer comme traité
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Afficherreclamation
