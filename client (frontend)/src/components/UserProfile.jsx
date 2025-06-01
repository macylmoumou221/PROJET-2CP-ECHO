"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Mail, Calendar, Shield, Briefcase, GraduationCap } from "lucide-react"
import axios from "axios"
import { FaInstagram, FaFacebook, FaGithub, FaLinkedin, FaTiktok, FaTwitter } from "react-icons/fa"
import { getImageUrl } from '../utils/imageUtils';

export default function UserProfile() {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const navigate = useNavigate()

  const socialIcons = {
    instagram: <FaInstagram className="text-pink-500 text-2xl hover:scale-110 transition-transform" />,
    facebook: <FaFacebook className="text-blue-600 text-2xl hover:scale-110 transition-transform" />,
    github: <FaGithub className="text-gray-800 text-2xl hover:scale-110 transition-transform" />,
    linkedin: <FaLinkedin className="text-blue-700 text-2xl hover:scale-110 transition-transform" />,
    tiktok: <FaTiktok className="text-black text-2xl hover:scale-110 transition-transform" />,
    x: <FaTwitter className="text-blue-500 text-2xl hover:scale-110 transition-transform" />,
  }

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true)
      setError(false)
      
      if (!userId) {
        setError(true)
        setLoading(false)
        return
      }

      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setError(true)
          setLoading(false)
          return
        }

        // First fetch user data
        const userResponse = await axios.get(`http://localhost:5000/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        // Then fetch user posts
        const postsResponse = await axios.get(`http://localhost:5000/api/users/${userId}/posts`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        const userData = userResponse.data.user
        const userPosts = postsResponse.data.posts || []

        setUser({
          id: userData._id,
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profilePicture: userData.profilePicture,
          bio: userData.bio,
          role: userData.role,
          group: userData.group,
          promotion: userData.promotion,
          socialLinks: userData.socialLinks || {},
          posts: userPosts,
          createdAt: new Date(userData.createdAt).toLocaleDateString()
        })

      } catch (err) {
        console.error("Error fetching user data:", err.response?.data || err.message)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  const renderRoleTag = (role) => {
    let icon;
    let text;
    switch (role) {
      case "admin":
        icon = <Shield size={14} className="inline-block mr-1" />;
        text = "Administrateur";
        break;
      case "teacher":
        icon = <Briefcase size={14} className="inline-block mr-1" />;
        text = "Enseignant";
        break;
      default:
        icon = <GraduationCap size={14} className="inline-block mr-1" />;
        text = "Étudiant";
    }
    return (
      <motion.div
        className="px-4 py-1.5 rounded-full text-sm font-semibold text-[#2A2A3B] bg-gradient-to-r from-[#3DDC97] to-white shadow-sm cursor-pointer hover:shadow-md transition-all duration-300 whitespace-nowrap"
        style={{ opacity: 0.9 }}
        whileHover={{ scale: 1.1, opacity: 1 }}
      >
        {icon}{text}
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 p-10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DDC97]"></div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <div className="max-w-md mx-auto">
          <img src="/placeholder.svg?height=200&width=200" alt="Not found" className="mx-auto mb-6 opacity-70" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Utilisateur non trouvé</h2>
          <p className="text-gray-500 mt-2 mb-6">
            L'utilisateur que vous recherchez n'existe pas ou n'est pas disponible.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-[#3DDC97] text-white px-4 py-2 rounded-full hover:bg-[#32c285] transition-colors"
          >
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 relative">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center">
              <motion.div
                className="w-24 h-24 rounded-full border-4 border-[#3DDC97] flex items-center justify-center overflow-hidden bg-gray-200 mb-4 relative group shadow-md"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                {/* Update the profile image */}
                <img
                  src={getImageUrl(user?.profilePicture)}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/src/assets/UserCircle.png";
                  }}
                />
              </motion.div>

              {user?.role === "student" && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm w-full mt-4">
                  <p className="text-lg font-medium mb-2 text-center">
                    <span className="font-semibold">Promo:</span>{" "}
                    <span className="text-[#3DDC97] font-medium">{user?.promotion}</span>
                  </p>
                  <p className="text-lg font-medium text-center">
                    <span className="font-semibold">Groupe:</span>{" "}
                    <span className="text-[#3DDC97] font-medium">{user?.group}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-[#2A2A3B]">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  {/* Role Tag */}
                  {renderRoleTag(user?.role)}
                </div>
                <p className="text-[#3DDC97] text-lg">@{user.username}</p>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-[#3DDC97] font-semibold">BIO</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 relative">
                    <div className="min-h-[60px]">
                      {user.bio ? (
                        <p className="text-gray-700">{user.bio}</p>
                      ) : (
                        <p className="text-gray-400 italic">Aucune bio disponible</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center">
                    <Mail size={18} className="text-[#3DDC97] mr-2" />
                    <span className="text-gray-700">{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={18} className="text-[#3DDC97] mr-2" />
                    <span className="text-gray-700">A rejoint en {user.createdAt}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="relative">
                <h3 className="text-lg font-semibold mb-3">Réseaux sociaux</h3>
                {Object.keys(user.socialLinks).length > 0 ? (
                  <div className="flex items-center gap-4 mt-3">
                    {Object.entries(user.socialLinks).map(([name, url]) => (
                      url && ( // Only display the icon if the URL is not empty
                        <a
                          key={name}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={name.charAt(0).toUpperCase() + name.slice(1)}
                        >
                          {socialIcons[name]}
                        </a>
                      )
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucun réseau social partagé</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-[#3DDC97] mr-2">PUBLICATIONS</span>
          <span className="text-gray-500 text-sm font-normal">({user.posts.length})</span>
        </h2>

        {user.posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.posts.map((post) => (
              <motion.div
                key={post._id}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{ y: -5 }}
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {post.media && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={post.media || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-1 text-[#2A2A3B]">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>

                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Cet utilisateur n'a pas encore publié</h3>
            <p className="text-gray-500">Aucune publication n'a été partagée par cet utilisateur pour le moment.</p>
          </div>
        )}
      </section>
    </div>
  )
}
