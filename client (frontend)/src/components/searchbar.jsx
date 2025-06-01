"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, ArrowRight, GraduationCap, Briefcase, Shield } from "lucide-react"
import { useNavigate } from "react-router-dom"
import axios from "axios"

const PLACEHOLDER_IMAGE = '/src/assets/UserCircle.png'
const DEFAULT_AVATAR = '/placeholder.svg'

export default function Searchbar({ username, isOpen, darkMode, userType, name, photoUrl, lastName }) {
  const [isFocused, setIsFocused] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  const fetchQuickSearchResults = useCallback(
    async (searchQuery) => {
      if (searchQuery.trim() === "") {
        setResults([])
        setSelectedIndex(-1)
        return
      }

      try {
        const token = localStorage.getItem("token") // Correct token key
        if (!token) {
          console.error("No auth token found in localStorage")
          return
        }
        console.log("Auth token:", token) // Debugging the token
        const response = await axios.get(`http://localhost:5000/api/users?search=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${token}`, // Add Authorization header
          },
        })
        const { users } = response.data
        setResults(
          users.map((user) => ({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            image: user.profilePicture,
            bio: user.bio,
            type: user.role,
            promo: user.promotion,
            group: user.group,
          }))
        )
        setSelectedIndex(users.length > 0 ? 0 : -1)
      } catch (error) {
        console.error("Error fetching quick search results:", error)
      }
    },
    []
  )

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      fetchQuickSearchResults(query)
    }, 300) // Debounce delay of 300ms

    return () => clearTimeout(debounceTimeout) // Clear timeout on cleanup
  }, [query, fetchQuickSearchResults])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          console.error("No auth token found")
          return
        }

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data && response.data.user) {
          setCurrentUser(response.data.user)
        } else {
          // Fallback to props if API response doesn't contain user data
          setCurrentUser({
            firstName: name,
            lastName,
            profilePicture: photoUrl,
            role: userType
          })
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
        // Use props as fallback on error
        setCurrentUser({
          firstName: name,
          lastName,
          profilePicture: photoUrl,
          role: userType
        })
      }
    }

    fetchCurrentUser()
  }, [name, lastName, photoUrl, userType])

  const handleSelectResult = (userId) => {
    setQuery("")
    setResults([])
    setSelectedIndex(-1)
    navigate(`/profile/${userId}`)
  }

  const handleKeyDown = (e) => {
    if (results.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectResult(results[selectedIndex].id)
      } else if (query.trim() !== "") {
        navigate(`/search?q=${encodeURIComponent(query)}`)
        setQuery("")
        setResults([])
      }
    }
  }

  return (
    <header
      className={`fixed top-0 right-0 h-16 select-none shadow-[0_4px_10px_rgba(0,0,0,0.1)]
        flex items-center justify-between px-6 transition-all duration-300 z-50
        ${darkMode ? "bg-[#242431] text-white" : "bg-white text-gray-800"}
        ${isOpen ? "w-[calc(100%-230px)]" : "w-[calc(100%-80px)]"}`}
    >
      <div className="text-lg font-semibold select-none">
        Salut, <span className="text-[#3ddc97]">{username}</span>
      </div>

      <div className="relative w-[50%] ml-6">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim() !== "") {
              navigate(`/search?q=${encodeURIComponent(query)}`)
              setQuery("")
              setResults([])
            }
          }}
          className={`relative flex items-center px-4 py-2 rounded-lg
            ${darkMode ? "bg-[#242431] text-white" : "bg-gray-100 text-gray-600"}`}
        >
          <Search className="absolute left-3 text-gray-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={isFocused ? "" : "Rechercher sur ECHO"}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={handleKeyDown}
            className={`bg-transparent focus:outline-none pl-10 w-full
              ${
                darkMode
                  ? "text-white placeholder-transparent md:placeholder-gray-400"
                  : "text-gray-600 placeholder-transparent md:placeholder-gray-400"
              }`}
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#3ddc97] text-white px-4 py-2 rounded-lg h-full transition-all cursor-pointer"
          >
            <span className="hidden md:inline">Rechercher</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {isFocused && results.length > 0 && (
          <div className="absolute top-full mt-1 w-full bg-white shadow-lg rounded-lg max-h-96 overflow-auto z-50">
            {results.map((result, index) => (
              <div
                key={result.id}
                onMouseDown={() => handleSelectResult(result.id)}
                className={`p-3 flex items-start cursor-pointer rounded-md
                  ${index === selectedIndex ? "bg-[#3ddc9730]" : "hover:bg-[#3ddc9715]"}`}
              >
                <img
                  src={result.image || DEFAULT_AVATAR}
                  alt={`${result.firstName} ${result.lastName}`}
                  className="w-8 h-8 rounded-full object-cover mr-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {result.firstName} {result.lastName}
                    </span>
                    {result.type === "admin" ? (
                      <Shield size={16} className="text-[#3ddc97]" />
                    ) : result.type === "student" ? (
                      <GraduationCap size={16} className="text-[#3ddc97]" />
                    ) : (
                      <Briefcase size={16} className="text-[#3ddc97]" />  // Add missing teacher icon
                    )}
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-1">{result.bio}</p>
                  {result.type === "student" ? (
                    <div className="text-xs text-[#3ddc97] mt-1">
                      Promo: {result.promo} | Groupe: {result.group}
                    </div>
                  ) : (
                    <div className="text-xs text-[#3ddc97] mt-1">
                      {result.department} | {result.specialization}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isFocused && query.trim() !== "" && results.length === 0 && (
          <div className="absolute top-full mt-1 w-full bg-white shadow-md rounded-md p-4 text-gray-600">
            <div className="text-center">
              <p className="font-medium">Aucun résultat trouvé</p>
              <p className="text-sm text-gray-400 mt-1">Essayez avec d'autres termes de recherche</p>
              <button
                className="mt-2 text-[#3ddc97] hover:underline"
                onMouseDown={(e) => {
                  e.preventDefault()
                  navigate(`/search?q=${encodeURIComponent(query)}`)
                  setQuery("")
                }}
              >
                Rechercher "{query}" dans tous les résultats
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className="flex items-center gap-2 text-gray-500 select-none relative cursor-pointer group"
        onClick={() => navigate("/profile")}
      >
        <div className="relative w-10 h-10">
          <img
            loading="lazy"
            src={currentUser?.profilePicture || PLACEHOLDER_IMAGE}
            alt={`${currentUser?.firstName || name} ${currentUser?.lastName || lastName}`}
            className="w-10 h-10 object-cover rounded-full bg-gray-300 ring-2 ring-offset-2 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = PLACEHOLDER_IMAGE;
            }}
          />
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-lg transform transition-transform duration-300 group-hover:scale-110">
            {currentUser?.role === "admin" ? (
              <Shield size={14} className="text-[#3ddc97] drop-shadow-md" />
            ) : currentUser?.role === "teacher" ? (
              <Briefcase size={14} className="text-[#3ddc97] drop-shadow-md" />
            ) : (
              <GraduationCap size={14} className="text-[#3ddc97] drop-shadow-md" />
            )}
          </div>
        </div>
        <span className="font-medium group-hover:text-[#3ddc97] transition-colors duration-300">
          {currentUser?.firstName || name} {currentUser?.lastName || lastName}
        </span>
      </div>
    </header>
  )
}
