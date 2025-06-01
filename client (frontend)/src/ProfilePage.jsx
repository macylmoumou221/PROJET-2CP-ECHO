"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  FaCheck,
  FaInstagram,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaTiktok,
  FaTwitter,
  FaTrash,
  FaEdit,
} from "react-icons/fa"
import { motion, AnimatePresence } from "framer-motion"
import axios from "axios"
import useApiRequest from "./hooks/useApiRequest"
import { Shield, Briefcase, GraduationCap } from "lucide-react"

export default function ProfilePage({ user }) {
  const navigate = useNavigate()
  // console.log('user is',user)
  const [bio, setBio] = useState(user?.bio || "")
  const [editingBio, setEditingBio] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePicture || null)
  const [showSocialPopup, setShowSocialPopup] = useState(false)
  const [socialMedias, setSocialMedias] = useState(user?.socialLinks || []) // Ensure socialMedias is initialized as an array
  const [currentSocial, setCurrentSocial] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [firstName, setFirstName] = useState(user?.firstName)
  const [lastName, setLastName] = useState(user?.lastName)
  const [hasChanges, setHasChanges] = useState(false)
  const [showSaveButton, setShowSaveButton] = useState(false)
  const [username, setUsername] = useState(user?.username)
  const [profilePictureUrl, setProfilePictureUrl] = useState("")
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [posts, setPosts] = useState([])
  const [loadingPosts, setLoadingPosts] = useState(true)
  const [Apierror, setApiError] = useState(null)
  const {data , error , loading , refetch, BASE_URL} = useApiRequest()
  console.log(user)
  useEffect(() => {
    const fetchPosts = async () => {
      try{
        const result = await refetch(`/api/users/${user._id}/posts`, 'GET')
        setPosts(result.posts)
        setLoadingPosts(false)
        console.log(result)
      }catch(err)
      {

      }}
    fetchPosts()
  }, [user?._id]) 

  console.log(posts)

  const fileInputRef = useRef(null)
  const bioInputRef = useRef(null)
  const popupRef = useRef(null)
  const urlInputRef = useRef(null)
console.log(user)

  const socialOptions = [
    { id: "instagram", name: "Instagram", icon: <FaInstagram className="text-pink-500" />, url: user?.socialLinks?.instagram },
    { id: "facebook", name: "Facebook", icon: <FaFacebook className="text-blue-600" />, url: user?.socialLinks?.facebook },
    { id: "github", name: "GitHub", icon: <FaGithub className="text-gray-800" />, url: user?.socialLinks?.github },
    { id: "linkedin", name: "LinkedIn", icon: <FaLinkedin className="text-blue-700" />, url: user?.socialLinks?.linkedin },
    { id: "tiktok", name: "TikTok", icon: <FaTiktok className="text-black" />, url: user?.socialLinks?.tiktok },
    { id: "x", name: "X", icon: <FaTwitter className="text-blue-500" />, url: user?.socialLinks?.x },
  ]

  useEffect(() => {
    if (editingBio && bioInputRef.current) {
      bioInputRef.current.focus()
      const range = document.createRange()
      const selection = window.getSelection()
      range.selectNodeContents(bioInputRef.current)
      range.collapse(false)
      selection?.removeAllRanges()
      selection?.addRange(range)
    }
  }, [editingBio])

  useEffect(() => {
    function handleClickOutside(event) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowSocialPopup(false)
        resetSocialForm()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    setShowSaveButton(hasChanges)
  }, [hasChanges])

  const resetSocialForm = () => {
    setCurrentSocial("")
    setCurrentUrl("")
    setIsEditing(false)
  }

  const saveBio = async () => {
    if (bioInputRef.current) {
      const newBio = bioInputRef.current.innerText.trim();
      setBio(newBio);

      try {
        const token = localStorage.getItem("token"); // Ensure token is retrieved
        const response = await axios.put(
          '/api/users/profile',
          { bio: newBio },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Add Authorization header
            },
          }
        );
        console.log("Bio update response:", response);
        setHasChanges(false);
        setEditingBio(false);
      } catch (err) {
        console.error("Failed to update bio:", err);
      }
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Show immediate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result); // Set base64 preview immediately
      };
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("profilePicture", file);

        const token = localStorage.getItem("token");
        const response = await axios.put(
          "http://localhost:5000/api/users/profile",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data?.profilePicture) {
          // Update with server URL after successful upload
          setProfilePhoto(response.data.profilePicture);
        }
      } catch (err) {
        console.error("Failed to update profile picture:", err);
        // Revert to old picture on error
        setProfilePhoto(user?.profilePicture || null);
      }
    }
  };

  const getImageUrl = (url) => {
    if (!url) return "/src/assets/UserCircle.png";
    if (url.startsWith('data:')) return url; // Handle base64 images
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const handleUrlPhotoChange = async () => {
    if (profilePictureUrl) {
      setProfilePhoto(profilePictureUrl);
      setHasChanges(true);
      setShowUrlInput(false);
      setProfilePictureUrl("");

      // Send the request with JSON body
      try {
        await refetch('/api/users/profile', 'PUT', { profilePicture: profilePictureUrl });
      } catch (err) {
        console.error("Failed to update profile picture URL:", err);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveBio()
    } else if (e.key === "Escape") {
      e.preventDefault()
      setEditingBio(false)
    }
  }

  const handleSocialSelect = (socialId) => {
    setCurrentSocial(socialId)
  }

  const addSocialMedia = async () => {
    if (currentSocial && currentUrl) {
      try {
        let formattedUrl = currentUrl.trim();
        if (!/^https?:\/\//i.test(formattedUrl)) {
          formattedUrl = `https://${formattedUrl}`;
        }

        // Create updated socialLinks object
        const updatedSocialLinks = {
          ...user.socialLinks,
          [currentSocial]: formattedUrl
        };

        // Make API request to update profile
        const token = localStorage.getItem("token");
        const response = await axios.put(
          "http://localhost:5000/api/users/profile",
          { socialLinks: updatedSocialLinks },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 200) {
          // Update local state
          setSocialMedias(prev => ({
            ...prev,
            [currentSocial]: formattedUrl
          }));

          // Update user state with new social links
          user.socialLinks = updatedSocialLinks;

          // Close popup and reset form
          setShowSocialPopup(false);
          resetSocialForm();

          // Show success notification
          const notification = document.createElement("div");
          notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center";
          notification.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Réseau social ajouté avec succès!</span>
          `;
          document.body.appendChild(notification);
          setTimeout(() => {
            notification.classList.add("opacity-0", "transition-opacity", "duration-500");
            setTimeout(() => document.body.removeChild(notification), 500);
          }, 3000);
        }
      } catch (err) {
        console.error("Error updating social links:", err);
        alert("Erreur lors de la mise à jour des réseaux sociaux");
      }
    }
  };

  const removeSocialMedia = async (socialId) => {
    try {
      const updatedSocialLinks = { ...user.socialLinks };
      delete updatedSocialLinks[socialId];

      // Make API request to update profile
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        { socialLinks: updatedSocialLinks },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Update local state
        setSocialMedias(prev => {
          const updated = { ...prev };
          delete updated[socialId];
          return updated;
        });

        // Update user state
        user.socialLinks = updatedSocialLinks;
      }
    } catch (err) {
      console.error("Error removing social link:", err);
      alert("Erreur lors de la suppression du réseau social");
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value)
    setHasChanges(true)
  }

  const saveAllChanges = () => {
    setHasChanges(false)
    setShowSaveButton(false)

    const notification = document.createElement("div")
    notification.className =
      "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
    notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Profil mis à jour avec succès!</span>
    `

    document.body.appendChild(notification)

    setTimeout(() => {
      notification.classList.add("opacity-0", "transition-opacity", "duration-500")
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 500)
    }, 3000)
  }

  const getRoleDisplay = (role) => {
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
  };

  const renderRoleSpecificInfo = () => {
    if (user?.role === "teacher") {
      return null
    } else {
      return (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 shadow-sm w-full">
          <p className="text-lg font-medium mb-2 text-center">
            <span className="font-semibold">Promotion:</span> <span className="text-[#3DDC97] font-medium">{user?.promotion}</span>
          </p>
          <p className="text-lg font-medium text-center">
            <span className="font-semibold">Groupe:</span> <span className="text-[#3DDC97] font-medium">{user?.group}</span>
          </p>
        </div>
      )
    }
  }

  const renderPostsSection = () => {
    if (loadingPosts) {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="max-w-md mx-auto">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Error loading posts</h3>
            <p className="text-gray-500">{error}</p>
          </div>
        </div>
      )
    }

    if (!posts || posts.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <div className="max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {user?.role === "teacher" ? "Vous n'avez pas encore publié" : "Cet utilisateur n'a pas encore publié"}
            </h3>
            <p className="text-gray-500">
              {user?.role === "teacher"
                ? "Commencez à partager vos cours et ressources avec vos étudiants."
                : "Aucune publication n'a été partagée par cet utilisateur pour le moment."}
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post._id}  // Changed from post.id
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5 }}
            onClick={() => navigate(`/post/${post._id}`)}  // Changed from post.id
          >
            {post.mediaType != 'none' && (
              <div className="relative h-48 w-full overflow-hidden">
                {post.mediaType === "image" ? (
                  <img
                    src={post.media || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative h-full w-full">
                    <img
                      src={post.media || "/placeholder.svg"}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white bg-opacity-30 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[#3DDC97] flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="p-4">
              <h3 className="font-bold text-lg mb-1 text-[#2A2A3B]">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.content}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  {user?.profilePicture ? (
                    <img
                      src={user?.profilePicture || "/placeholder.svg"}
                      alt={user?.firstName}
                      className="w-6 h-6 rounded-full mr-2 object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full mr-2 bg-gray-200 flex items-center justify-center text-xs font-semibold">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                  <span>
                    {user?.firstName} {user?.lastName}
                  </span>
                </div>
                <span className="text-xs">{post?.date}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 p-6 relative">
      <AnimatePresence>
        {showSaveButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={saveAllChanges}
            className="fixed bottom-6 right-6 bg-[#3DDC97] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#2cb581] transition-colors z-50 flex items-center"
          >
            <FaCheck className="mr-2" />
            Enregistrer les modifications
          </motion.button>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="flex flex-col items-center">
              <motion.div 
                className={`w-28 h-28 rounded-full border-4 border-[#3DDC97] flex items-center justify-center overflow-hidden bg-gray-200 mb-4 relative group shadow-md ${
                  editingBio ? 'ring-4 ring-[#3DDC97]/50' : ''
                }`}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <img
                  src={getImageUrl(profilePhoto)}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/src/assets/UserCircle.png";
                  }}
                />
                <motion.div
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.1 }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </motion.div>
              </motion.div>

              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handlePhotoChange} />

              <div className="flex flex-col gap-2 w-full">
                <motion.button
                  className="bg-gradient-to-r from-[#3DDC97] to-[#32c285] text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-all shadow-sm"
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Changer de photo
                </motion.button>

                {!showUrlInput ? (
                  <motion.button
                    className="bg-white border border-[#3DDC97] text-[#3DDC97] px-4 py-2 rounded-full text-sm hover:shadow-lg transition-all shadow-sm"
                    onClick={() => setShowUrlInput(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Utiliser une URL
                  </motion.button>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <input
                      type="text"
                      ref={urlInputRef}
                      placeholder="Entrez l'URL de l'image"
                      value={profilePictureUrl}
                      onChange={(e) => setProfilePictureUrl(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-[#3DDC97] focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUrlPhotoChange}
                        disabled={!profilePictureUrl}
                        className={`flex-1 px-2 py-1 rounded-md text-sm ${
                          profilePictureUrl ? "bg-[#3DDC97] text-white" : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        }`}
                      >
                        Appliquer
                      </button>
                      <button
                        onClick={() => {
                          setShowUrlInput(false)
                          setProfilePictureUrl("")
                        }}
                        className="flex-1 px-2 py-1 bg-gray-200 text-gray-700 rounded-md text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 w-full">{renderRoleSpecificInfo()}</div>
            </div>

            <div className="flex-1">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-semibold text-[#2A2A3B]">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  {/* Role Tag */}
                  {getRoleDisplay(user?.role)}
                </div>
                <p className="text-[#3DDC97] text-lg">@{user?.username}</p>

                <div>
                  <div className="flex items-center mb-2">
                    <span className="text-[#3DDC97] font-semibold">BIO</span>
                  </div>

                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 relative hover:border-[#3DDC97] transition-colors group">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={editingBio ? "editing" : "viewing"}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        {editingBio ? (
                          <div className="relative">
                            <span
                              ref={bioInputRef}
                              contentEditable={true}
                              suppressContentEditableWarning={true}
                              onKeyDown={handleKeyDown}
                              onInput={(e) => setHasChanges(true)}
                              className="block w-full min-h-[60px] text-gray-700 focus:outline-none"
                              value={user?.bio}
                            >
                              {user.bio}
                            </span>

                            <span className="absolute right-0 bottom-[-20px] text-xs text-gray-400">
                              {(bioInputRef.current?.innerText.length || bio.length || 0)}/150
                            </span>

                            <div className="absolute bottom-[-20px] right-0 text-xs text-gray-500">
                              Appuyez sur Entrée pour enregistrer
                            </div>
                          </div>
                        ) : (
                          <div className="min-h-[60px] cursor-pointer" onClick={() => setEditingBio(true)}>
                            {user?.bio ? (
                              <p className="text-gray-700">{user?.bio}</p>
                            ) : (
                              <p className="text-gray-400 italic">Cliquez pour ajouter une bio...</p>
                            )}

                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity">
                              <FaEdit className="text-gray-400 hover:text-[#3DDC97]" />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {!editingBio && (
                  <motion.button
                    className="bg-gradient-to-r from-[#3DDC97] to-[#32c285] text-white px-4 py-2 rounded-full text-sm hover:shadow-lg transition-all shadow-sm"
                    onClick={() => setEditingBio(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Modifier la bio
                  </motion.button>
                )}
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="relative">
                <button
                  onClick={() => setShowSocialPopup(true)}
                  className="bg-[#3DDC97] text-white px-4 py-2 rounded-full text-sm hover:bg-[#32c285] transition-colors shadow-sm w-full md:w-auto"
                >
                  Ajouter vos réseaux sociaux
                </button>

                <div className="flex items-center justify-center md:justify-end gap-3 mt-3">
                  {socialOptions.map((social) => (
                    social.url && ( // Only display the icon if the URL is not empty
                      <a
                        key={social.id}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-2xl hover:scale-110 transition-transform"
                        title={social.name}
                      >
                        {social.icon}
                      </a>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSocialPopup && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 backdrop-blur-lg bg-black/30"></div>
          <div className="relative h-full w-full flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-lg shadow-lg p-4 w-80 max-w-[90%] z-10"
              ref={popupRef}
            >
              <h3 className="text-lg font-semibold mb-3">
                {isEditing ? "Modifier un réseau social" : "Ajouter un réseau social"}
              </h3>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Choisir un réseau</label>
                <div className="grid grid-cols-2 gap-2">
                  {socialOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSocialSelect(option.id)}
                      className={`flex items-center gap-2 p-2 rounded-md text-left text-sm ${
                        currentSocial === option.id
                          ? "bg-green-100 border border-[#3DDC97]"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {option.icon}
                      <span>{option.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Lien</label>
                <input
                  type="text"
                  value={currentUrl}
                  onChange={(e) => setCurrentUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 border border-gray-300 rounded-md text-sm focus:border-[#3DDC97] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    resetSocialForm()
                    setShowSocialPopup(false)
                  }}
                  className="px-3 py-1.5 bg-gray-200 text-gray-800 rounded-md text-sm hover:bg-gray-300 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={addSocialMedia}
                  disabled={!currentSocial || !currentUrl.trim()}
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    currentSocial && currentUrl.trim()
                      ? "bg-[#3DDC97] text-white hover:bg-[#32c285]"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  } transition-colors`}
                >
                  {isEditing ? "Mettre à jour" : "Ajouter"}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="text-[#3DDC97] mr-2">
            {user?.role === "teacher" ? "VOS PUBLICATIONS" : "TES PUBLICATIONS"}
          </span>
          <span className="text-gray-500 text-sm font-normal">({loadingPosts ? "..." : posts.length})</span>
        </h2>

        {renderPostsSection()}
      </section>
    </div>
  )
}