"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import "./Reclamation.css"
import Afficherreclamation from "./Afficherreclamation"

const Reclamation = ({ userRole = "student", userId = 101 }) => {
  const [claims, setClaims] = useState([])
  const [filteredClaims, setFilteredClaims] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState(null)
  const [showClaimDetails, setShowClaimDetails] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teachers, setTeachers] = useState([])

  // Add new state for teachers list
  const [teachersList, setTeachersList] = useState([])

  // Form state
  const [formData, setFormData] = useState({
    teacherId: "",
    title: "",
    description: "",
  })

  const formRef = useRef(null)

  // Fetch teachers for students
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/users?role=teacher", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const teachersList = response.data.users.map(teacher => ({
          id: teacher._id,
          name: `${teacher.firstName} ${teacher.lastName}`
        }))
        setTeachers(teachersList)
        setTeachersList(response.data.users)
      } catch (err) {
        setError("Failed to load teachers")
      }
    }

    if (userRole === "student") {
      fetchTeachers()
    }
  }, [userRole])

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        const endpoint = userRole === "teacher" ? "/api/claims/received" : "/api/claims/my-claims"
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const mappedClaims = response.data.map(claim => ({
          id: claim._id,
          title: claim.title,
          description: claim.details,
          teacherId: claim.teacher._id,
          teacherName: `${claim.teacher.firstName} ${claim.teacher.lastName}`,
          student: claim.student,
          studentId: claim.student,
          date: new Date(claim.createdAt).toLocaleDateString('fr-FR'),
          status: claim.status,
          response: claim.response || "",
          isResponded: claim.isResponded,
          createdAt: claim.createdAt,
          updatedAt: claim.updatedAt
        }))

        setFilteredClaims(mappedClaims)
        setLoading(false)
      } catch (err) {
        setError("Failed to load claims")
        setLoading(false)
      }
    }

    fetchClaims()
  }, [userRole])

  // Handle form submission
  const handleSubmitClaim = async () => {
    if (!formData.teacherId || !formData.title || !formData.description) {
      alert("Veuillez remplir tous les champs")
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        "http://localhost:5000/api/claims",
        {
          teacher: formData.teacherId,
          title: formData.title,
          details: formData.description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (response.data && response.data.claim) { // Check if response.data.claim exists
        // Add the new claim to the list with proper mapping
        const newClaim = {
          id: response.data.claim._id,
          title: response.data.claim.title,
          description: response.data.claim.details,
          teacherId: response.data.claim.teacher._id,
          teacherName: `${response.data.claim.teacher.firstName} ${response.data.claim.teacher.lastName}`,
          student: response.data.claim.student,
          date: new Date(response.data.claim.createdAt).toLocaleDateString('fr-FR'),
          status: response.data.claim.status,
          response: response.data.claim.response || "",
          isResponded: response.data.claim.isResponded,
          createdAt: response.data.claim.createdAt
        }

        setFilteredClaims(prev => [newClaim, ...prev])
        
        // Reset form and close
        setFormData({ teacherId: "", title: "", description: "" })
        setShowForm(false)
        
        // Show success notification
        alert("Réclamation envoyée avec succès!")
      }
    } catch (err) {
      console.error("Error submitting claim:", err)
      alert(err.response?.data?.message || "Erreur lors de l'envoi de la réclamation")
    }
  }

  // Handle claim status update
  const handleUpdateClaimStatus = async (claimId, newStatus, response = "") => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      await axios.put(
        `http://localhost:5000/api/claims/${claimId}/respond`,
        {
          status: newStatus,
          response: response
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const updatedClaims = filteredClaims.map((claim) => {
        if (claim.id === claimId) {
          return { 
            ...claim, 
            status: newStatus, 
            response,
            isResponded: true,
            updatedAt: new Date().toISOString()
          }
        }
        return claim
      })

      setFilteredClaims(updatedClaims)
      setSelectedClaim(null)
      setShowClaimDetails(false)
      alert(newStatus === "dealt" ? "Réclamation traitée avec succès!" : "Réclamation rejetée avec succès!")
    } catch (err) {
      alert("Erreur lors de la mise à jour de la réclamation")
    }
  }

  // Handle claim selection
  const handleSelectClaim = (claim) => {
    setSelectedClaim(claim)
    setShowClaimDetails(true)
  }

  // Handle click outside form
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setShowForm(false)
      }
    }

    if (showForm) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showForm])

  useEffect(() => {
    const fetchClaimDetails = async (studentId) => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`http://localhost:5000/api/users/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.user;
      } catch (err) {
        console.error("Error fetching student details:", err);
        return null;
      }
    };

    const fetchClaims = async () => {
      try {
        const token = localStorage.getItem("token");
        const endpoint = userRole === "teacher" ? "/api/claims/received" : "/api/claims/my-claims";
        
        const response = await axios.get(`http://localhost:5000${endpoint}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const mappedClaims = await Promise.all(response.data.map(async (claim) => {
          // Fetch student details if we're a teacher
          let studentDetails = null;
          if (userRole === "teacher" && claim.student) {
            studentDetails = await fetchClaimDetails(claim.student);
          }

          return {
            id: claim._id,
            title: claim.title,
            description: claim.details,
            teacherId: claim.teacher._id,
            teacherName: `${claim.teacher.firstName} ${claim.teacher.lastName}`,
            studentName: userRole === "teacher" 
              ? (studentDetails ? `${studentDetails.firstName} ${studentDetails.lastName}` : "Étudiant inconnu")
              : `${localStorage.getItem("firstName")} ${localStorage.getItem("lastName")}`,
            studentId: claim.student,
            date: new Date(claim.createdAt).toLocaleDateString('fr-FR'),
            status: claim.status,
            response: claim.response || "",
            isResponded: claim.isResponded,
            updatedAt: claim.updatedAt ? new Date(claim.updatedAt).toLocaleDateString('fr-FR') : null
          };
        }));

        setFilteredClaims(mappedClaims);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching claims:", err);
        setError("Failed to load claims");
        setLoading(false);
      }
    };

    fetchClaims();
  }, [userRole])


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ddc97]"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="Appreclamation">
      <div className="containerreclamation">
        <div className="mainreclamation">
          {/* Claims display */}
          <div className="claims-container">
            <Afficherreclamation
              claims={filteredClaims}
              onSelectClaim={handleSelectClaim}
              selectedClaim={selectedClaim}
              showDetails={showClaimDetails}
              onCloseDetails={() => setShowClaimDetails(false)}
              onUpdateStatus={handleUpdateClaimStatus}
              userRole={userRole}
              teachers={teachers}
            />
          </div>

          {/* Add claim button (only for students) */}
          {userRole === "student" && (
            <button className="buttonpourajouterreclamation" onClick={() => setShowForm(true)}>
              +
            </button>
          )}

          {/* Claim form */}
          {showForm && userRole === "student" && (
            <div className="lesreclamations" ref={formRef}>
              <div className="distination">
                <span className="distination1">À</span>
                <select
                  className="distination2"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
                >
                  <option value="">Sélectionner un enseignant...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="objet">
                <span className="objet2">Objet</span>
                <input
                  type="text"
                  className="objet3"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de votre réclamation..."
                />
              </div>

              <textarea
                className="reclamation"
                placeholder="Décrivez votre réclamation en détail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              ></textarea>

              <button className="buttondemessage" onClick={handleSubmitClaim}>
                <span>ENVOYER</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reclamation
