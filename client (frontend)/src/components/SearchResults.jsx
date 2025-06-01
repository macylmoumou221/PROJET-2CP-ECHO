"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import { motion } from "framer-motion"
import { getImageUrl } from '../utils/imageUtils';

const DEFAULT_IMAGE = '/placeholder.svg'
const USER_PLACEHOLDER = '/src/assets/UserCircle.png'

export default function SearchResults() {
  const location = useLocation()
  const navigate = useNavigate()
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] })
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [query, setQuery] = useState("")
  const [showNoResults, setShowNoResults] = useState(false)

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const q = searchParams.get("q")
    if (q) {
      setQuery(q)
      fetchSearchResults(q)
    }
  }, [location.search])

  const fetchSearchResults = async (keyword) => {
    setIsSearching(true)
    setShowNoResults(false)
    try {
      const token = localStorage.getItem("token") // Correct token key
      if (!token) {
        console.error("No auth token found in localStorage")
        return
      }
      console.log("Auth token:", token) // Debugging the token
      const [usersResponse, postsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/users?search=${keyword}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`http://localhost:5000/api/posts?search=${keyword}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])
      console.log("Users response:", usersResponse.data) // Log users response
      console.log("Posts response:", postsResponse.data) // Log posts response

      const users = usersResponse.data.users || [] // Ensure users is an array
      const posts = postsResponse.data.posts || [] // Ensure posts is an array

      setSearchResults({
        users: users.map((user) => ({
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          image: user.profilePicture,
          bio: user.bio,
          type: user.role,
          promo: user.promotion,
          group: user.group,
          department: user.department,
          specialization: user.specialization,
        })),
        posts: posts.map((post) => ({
          id: post._id,
          title: post.title,
          content: post.content,
          image: post.media,
          author: post.author?.username || "Unknown",
          authorImage: post.author?.profilePicture || "/placeholder.svg",
          date: new Date(post.createdAt).toLocaleDateString(),
        })),
      })
    } catch (error) {
      console.error("Error fetching search results:", error)
    } finally {
      setIsSearching(false)
      setShowNoResults(false) // Ensure this is set to false when results are fetched
    }
  }

  const filteredResults = () => {
    if (activeTab === "all") {
      return searchResults
    } else if (activeTab === "users") {
      return { users: searchResults.users, posts: [] }
    } else if (activeTab === "posts") {
      return { users: [], posts: searchResults.posts }
    }
    return searchResults
  }

  const results = filteredResults()
  const hasResults = results.users.length > 0 || results.posts.length > 0 // Ensure this correctly evaluates the presence of results

  return (
    <div className="p-6 pt-20">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Résultats pour <span className="text-[#3ddc97]">"{query}"</span>
        </h1>
        <p className="text-gray-500 mt-1">
          {hasResults
            ? `${results.users.length + results.posts.length} résultats trouvés`
            : isSearching
            ? "Recherche en cours..."
            : "Aucun résultat trouvé"}
        </p>
      </div>

      {isSearching && !hasResults ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-[#3ddc97] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Recherche en cours...</p>
        </div>
      ) : hasResults ? (
        <div className="space-y-8">
          {/* Users section */}
          {results.users.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-[#3ddc97] mr-2">Utilisateurs</span>
                <span className="text-sm text-gray-500 font-normal">({results.users.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.users.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/profile/${user.id}`)}
                  >
                    <div className="p-4">
                      <div className="flex items-start">
                        <img
                          src={getImageUrl(user.image)}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-10 h-10 rounded-full object-cover mr-3"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = USER_PLACEHOLDER;
                          }}
                        />
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {user.firstName} {user.lastName}
                          </h3>
                          <p className="text-[#3ddc97] text-sm">@{user.username}</p>
                          <p className="text-gray-500 text-sm mt-1 line-clamp-2">{user.bio}</p>

                          {user.type === "student" ? (
                            <div className="text-xs text-[#3ddc97] mt-2">
                              Promo: {user.promo} | Groupe: {user.group}
                            </div>
                          ) : (
                            <div className="text-xs text-[#3ddc97] mt-2">
                              {user.department} | {user.specialization}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Posts section */}
          {results.posts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="text-[#3ddc97] mr-2">Publications</span>
                <span className="text-sm text-gray-500 font-normal">({results.posts.length})</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/post/${post.id}`)}
                  >
                    {post.image && post.image !== '' && (
                      <img
                        src={post.image || DEFAULT_IMAGE}
                        alt={post.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = DEFAULT_IMAGE;
                        }}
                      />
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{post.title}</h3>
                      <p className="text-gray-500 text-sm mb-2 line-clamp-2">{post.content}</p>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <img
                            src={post.authorImage || "/placeholder.svg"}
                            alt={post.author}
                            className="w-5 h-5 rounded-full mr-1"
                          />
                          <span>{post.author}</span>
                        </div>
                        <span>{post.date}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Aucun résultat trouvé</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Nous n'avons trouvé aucun résultat pour "{query}". Essayez avec d'autres termes ou vérifiez l'orthographe.
          </p>
        </div>
      )}
    </div>
  )
}
