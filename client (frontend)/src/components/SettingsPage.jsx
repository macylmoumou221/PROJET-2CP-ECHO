"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Bookmark } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile")
  const [showOnlineStatus, setShowOnlineStatus] = useState(true)
  const [emailNotif, setEmailNotif] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("password123")
  const [language, setLanguage] = useState("Français")
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)

  const [savedPosts, setSavedPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const languageOptions = ["Français", "English"]
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLanguageOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const fetchUserDataAndPosts = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError("Authentication required")
          setLoading(false)
          return
        }

        // Get current user data
        const userResponse = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        console.log("User data response:", userResponse.data)
        
        // savedPosts is a top-level field in the user data
        const savedPostIds = userResponse.data.savedPosts || []
        console.log("Found saved post IDs:", savedPostIds)

        if (savedPostIds.length > 0) {
          const fetchedPosts = await Promise.all(
            savedPostIds.map(async (postId) => {
              try {
                console.log("Fetching post:", postId)
                const postResponse = await axios.get(
                  `http://localhost:5000/api/posts/${postId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` }
                  }
                )
                
                const post = postResponse.data
                console.log("Fetched post data:", post)

                return {
                  id: post._id,
                  title: post.title,
                  content: post.content,
                  author: `${post.author.firstName} ${post.author.lastName}`,
                  authorImage: post.author.profilePicture,
                  date: new Date(post.createdAt).toLocaleDateString(),
                  image: post.media,
                  mediaType: post.mediaType
                }
              } catch (err) {
                console.error(`Error fetching post ${postId}:`, err)
                return null
              }
            })
          )

          const validPosts = fetchedPosts.filter(post => post !== null)
          console.log("Final processed posts:", validPosts)
          setSavedPosts(validPosts)
        } else {
          console.log("No saved posts found")
          setSavedPosts([])
        }
        
        setLoading(false)
      } catch (err) {
        console.error("Error fetching data:", err)
        console.error("Error details:", err.response?.data)
        setError("Failed to load saved posts")
        setLoading(false)
      }
    }

    fetchUserDataAndPosts()
  }, [])

  // Add this useEffect to fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        })

        setUsername(response.data.username)
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }

    fetchUserData()
  }, [])

  // Modify handleSaveChanges function
  const handleSaveChanges = async (e) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      if (activeTab === "Profile") {
        await axios.put(
          "http://localhost:5000/api/users/profile",
          { username },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      }

      // Show success notification
      const notification = document.createElement("div")
      notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>${
          activeTab === "Profile"
            ? "Profil mis à jour avec succès!"
            : activeTab === "Compte et confidentialité"
              ? "Paramètres de compte mis à jour avec succès!"
              : activeTab === "Publications sauvegardées"
                ? "Publications mises à jour avec succès!"
                : "Préférences mises à jour avec succès!"
        }</span>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(notification), 500)
      }, 3000)

    } catch (err) {
      console.error("Error updating profile:", err)
      alert("Failed to update profile")
    }
  }

  const handleUnsavePost = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      // Send DELETE request to unsave the post
      await axios.delete(`http://localhost:5000/api/users/saved/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Update UI by removing the unsaved post
      setSavedPosts(prevPosts => prevPosts.filter(post => post.id !== postId))

      // Show success notification
      const notification = document.createElement("div")
      notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>Publication retirée des favoris</span>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(notification), 500)
      }, 3000)

    } catch (err) {
      console.error("Error removing saved post:", err)
      alert("Erreur lors du retrait de la publication des favoris")
    }
  }

  const CustomLanguageDropdown = () => {
    return (
      <div className="relative w-full" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsLanguageOpen(!isLanguageOpen)}
          className="w-full flex items-center justify-between border border-gray-300 rounded px-4 py-2 bg-white hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3ddc97] focus:border-[#3ddc97] transition-colors"
        >
          <span>{language}</span>
          <motion.div animate={{ rotate: isLanguageOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={18} />
          </motion.div>
        </button>

        <AnimatePresence>
          {isLanguageOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
            >
              {languageOptions.map((option) => (
                <motion.div
                  key={option}
                  whileHover={{ color: "#3ddc97" }}
                  onClick={() => {
                    setLanguage(option)
                    setIsLanguageOpen(false)
                  }}
                  className={`px-4 py-2 cursor-pointer ${language === option ? "text-[#3ddc97]" : ""}`}
                >
                  {option}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const CustomSwitch = ({ checked, onChange, label }) => {
    return (
      <div className="flex items-center justify-between group cursor-pointer" onClick={onChange}>
        <span>{label}</span>
        <button
          className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none group-hover:opacity-90 ${
            checked ? "bg-[#3ddc97]" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
              checked ? "translate-x-6" : ""
            }`}
          />
        </button>
      </div>
    )
  }

  const renderTabContent = () => {
    const content = (() => {
      switch (activeTab) {
        case "Profile":
          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Informations personnelles</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block mb-1 text-gray-700">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3ddc97] focus:border-[#3ddc97] transition-colors"
                    />
                  </div>
                </form>
              </div>
              <div className="mt-4 flex justify-end max-w-2xl">
                <motion.button
                  onClick={handleSaveChanges}
                  className="bg-[#3ddc97] text-white px-6 py-2 rounded-full hover:bg-[#2cb581] transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enregistrer les modifications
                </motion.button>
              </div>
            </>
          )
        case "Compte et confidentialité":
          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Informations sur votre compte</h3>
                <form className="space-y-6">
                  <div>
                    <label className="block mb-1 text-gray-700">Mot de passe</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border border-gray-300 rounded px-4 py-2 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-[#3ddc97] focus:border-[#3ddc97] transition-colors"
                    />
                  </div>
                  <div className="mt-6">
                    <h4 className="text-lg font-semibold mb-2">Confidentialité</h4>
                    <div className="space-y-4">
                      <CustomSwitch
                        checked={showOnlineStatus}
                        onChange={() => setShowOnlineStatus(!showOnlineStatus)}
                        label="Statut en ligne"
                      />
                    </div>
                  </div>
                </form>
              </div>
              <div className="mt-4 flex justify-end max-w-2xl">
                <motion.button
                  onClick={handleSaveChanges}
                  className="bg-[#3ddc97] text-white px-6 py-2 rounded-full hover:bg-[#2cb581] transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enregistrer les modifications
                </motion.button>
              </div>
            </>
          )
        case "Publications sauvegardées":
          const renderSavedPosts = () => {
            if (loading) {
              return <div>Loading saved posts...</div>
            }

            if (error) {
              return <div>Error: {error}</div>
            }

            if (savedPosts.length === 0) {
              return (
                <div className="text-center py-10">
                  <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
                  <h4 className="text-lg font-medium text-gray-500 mb-2">Aucune publication sauvegardée</h4>
                  <p className="text-gray-400">Les publications que vous sauvegardez apparaîtront ici</p>
                </div>
              )
            }

            return (
              <div className="space-y-6">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <img
                          src={post.authorImage || "/placeholder.svg"}
                          alt={post.author}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <h4 className="font-medium">{post.author}</h4>
                          <p className="text-xs text-gray-500">{post.date}</p>
                        </div>
                      </div>

                      <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                      <p className="text-gray-700 mb-3 line-clamp-2">{post.content}</p>

                      {post.image && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          <img
                            src={post.image || "/placeholder.svg"}
                            alt={post.title}
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUnsavePost(post.id)
                          }}
                          className="flex items-center text-sm text-[#3ddc97] hover:text-[#2cb581] transition-colors"
                        >
                          <Bookmark size={18} className="mr-1 fill-current" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          }

          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-4xl">
                <h3 className="text-xl font-semibold mb-4">Mes publications sauvegardées</h3>

                {renderSavedPosts()}
              </div>
            </>
          )
        case "Préférence":
          return (
            <>
              <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl">
                <h3 className="text-xl font-semibold mb-4">Préférences</h3>
                <form className="space-y-6">
                  <div>
                    <label className="block mb-1 text-gray-700">Langue</label>
                    <CustomLanguageDropdown />
                  </div>
                  <div className="space-y-4">
                    <CustomSwitch
                      checked={emailNotif}
                      onChange={() => setEmailNotif(!emailNotif)}
                      label="Notifications par email"
                    />
                  </div>
                </form>
              </div>
              <div className="mt-4 flex justify-end max-w-2xl">
                <motion.button
                  onClick={handleSaveChanges}
                  className="bg-[#3ddc97] text-white px-6 py-2 rounded-full hover:bg-[#2cb581] transition-colors shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Enregistrer les modifications
                </motion.button>
              </div>
            </>
          )
        default:
          return null
      }
    })()

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {content}
        </motion.div>
      </AnimatePresence>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Paramètre</h2>
        </div>

        <div className="border-b border-gray-300 mb-6">
          <ul className="flex space-x-8 overflow-x-auto pb-2 scrollbar-hide">
            {["Profile", "Compte et confidentialité", "Publications sauvegardées", "Préférence"].map((tab) => (
              <li
                key={tab}
                className={`pb-2 cursor-pointer hover:text-[#3ddc97] transition-colors whitespace-nowrap ${
                  activeTab === tab ? "border-b-2 border-[#3ddc97] text-[#3ddc97]" : "text-gray-500"
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>

        {renderTabContent()}
      </div>
    </div>
  )
}
