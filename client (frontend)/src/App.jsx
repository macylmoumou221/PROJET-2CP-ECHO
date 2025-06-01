"use client"

import { useState, useEffect } from "react"
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom"
import "./App.css"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { ReportDialogProvider } from './contexts/ReportDialogContext';

// Pages
import Accueil from "./components/Accueil"
import Notification from "./components/Notification"
import Messagerie from "./components/Messagerie"
import Reclamation from "./components/Reclamation"
import SettingsPage from "./components/SettingsPage"
import SinglePost from "./components/SinglePost"
import LostFoundPage from "./components/LostFoundPage"
import SearchResults from "./components/SearchResults"
import UserProfile from "./components/UserProfile"
import ProfilePage from "./ProfilePage"
import LogIn from "./components/LogIn"
import Signup from "./components/Signup"
import ForgotPassword from "./components/ForgotPassword"
import Dashboard from "./components/dashboard"

// Composants globaux
import Sidebar from "./components/Sidebar"
import Searchbar from "./components/searchbar"
import ReportDialog from "./components/ReportDialog"

// Import current user from mockData
import GoogleRedirect from "./components/GoogleRedirect"
import useApiRequest from "./hooks/useApiRequest"

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem("sidebarOpen")
    return saved !== null ? saved === "true" : window.innerWidth >= 1024
  })
  const [currentUser , setCurrentUser] = useState()
  const navigate = useNavigate()
  const location = useLocation()
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [reportPostId, setReportPostId] = useState(null)
  const {data, error, loading , refetch,BASE_URL} = useApiRequest()
  const userToken = localStorage.getItem("token")
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await refetch(`/api/auth/me`, 'GET')
        if (result) setCurrentUser(result)
      } catch (err) {
        console.error('Error fetching user:', err)
      }
    }
  
    fetchUser()
  }, [])
  
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    localStorage.setItem("sidebarOpen", sidebarOpen)
  }, [sidebarOpen])

  const handleOpenReportDialog = (postId) => {
    setReportPostId(postId)
    setReportDialogOpen(true)
  }

  const handleCloseReportDialog = () => {
    setReportDialogOpen(false)
    setReportPostId(null)
  }

  const handleSubmitReport = (postId, reason) => {
    alert(`Signalement envoyé pour le post ${postId}: "${reason}"`)
    handleCloseReportDialog()
  }

  useEffect(() => {
    window.openReportDialog = handleOpenReportDialog
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("userToken")
    navigate("/login")
  }

  // Auth routes
  const authRoutes = ["/login", "/signup", "/forgotpassword"]
  const isAuthRoute = authRoutes.includes(location.pathname.toLowerCase())

  // Redirection logique au tout premier accès
  useEffect(() => {
    const token = localStorage.getItem("userToken")
    const isAtRoot = location.pathname === "/"

    if (!token && isAtRoot) {
      navigate("/login")
    } else if (token && isAtRoot) {
      navigate("/accueil")
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId="801840850984-s0ofqjs8bprb4kr4l5amh2g8p4ebpd3j.apps.googleusercontent.com">
      <ReportDialogProvider>
      {isAuthRoute ? (
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LogIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
        </Routes>
      ) : (
        <div className="flex flex-col h-screen bg-white text-[#2A2A3B]">
          <div className="flex flex-1">
            <Sidebar expanded={sidebarOpen} setExpanded={setSidebarOpen} userRole={currentUser?.role} />

            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-[230px]" : "ml-[80px]"}`}>
              <div className="px-6 pt-6 flex justify-between items-center">
                <Searchbar
                  isOpen={sidebarOpen}
                  username={currentUser?.firstName}
                  darkMode={false}
                  userType={currentUser?.role}
                  name={currentUser?.firstName}
                  lastName={currentUser?.lastName}
                  photoUrl={currentUser?.profilePicture}
                />
              </div>

              <div className="pt-6 px-6">
                <Routes>
                <Route path="/api/auth/success" element={<GoogleRedirect />} />
                  <Route path="/acceuil" element={<Accueil />} />
                  <Route path="/notification" element={<Notification />} />
                  <Route path="/messagerie" element={<Messagerie />} />
                  <Route path="/messagerie/:userId" element={<Messagerie />} />
                  <Route
                    path="/reclamations"
                    element={<Reclamation userRole={currentUser?.role} userId={currentUser?._id} />}
                  />
                  <Route path="/objet-trouver" element={<LostFoundPage darkMode={false} />} />
                  {currentUser?.role === "admin" && <Route path="/dashboard" element={<Dashboard />} />}
                  <Route path="/parametre" element={<SettingsPage />} />
                  <Route path="/post/:postId" element={<SinglePost />} />
                  <Route path="/search" element={<SearchResults />} />
                  <Route path="/profile" element={<ProfilePage user={!loading ? currentUser : '' } />} />
                  <Route path="/profile/:userId" element={<UserProfile />} />
                </Routes>
              </div>
            </main>
          </div>

          <ReportDialog
            isOpen={reportDialogOpen}
            onClose={handleCloseReportDialog}
            onSubmit={handleSubmitReport}
            postId={reportPostId}
          />
        </div>
      )}
      </ReportDialogProvider>
    </GoogleOAuthProvider>
  )
}
