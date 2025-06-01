"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { Paperclip } from "lucide-react"
import "./Publication.css"
import AjoutPub from "./AjoutPub"

const Publication = () => {
  const [messages, setMessages] = useState([])
  const [postTitle, setPostTitle] = useState("")
  const [postText, setPostText] = useState("")
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaType, setMediaType] = useState(null) // 'image' or 'video'
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const imageInputRef = useRef(null)
  const postButtonRef = useRef(null)
  const [showImageUrlDialog, setShowImageUrlDialog] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const urlInputRef = useRef(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        
        const currentUserId = localStorage.getItem("userId")
        const mappedPosts = response.data.posts.map(post => {
          // Add null checks for author and its properties
          const author = post.author || {};
          return {
            _id: post._id,
            title: post.title,
            content: post.content,
            media: post.media,
            mediaType: post.mediaType,
            author: {
              name: author.firstName && author.lastName ? 
                `${author.firstName} ${author.lastName}` : 
                "Utilisateur inconnu",
              username: author.username || "utilisateur",
              avatar: author.profilePicture || "/src/assets/UserCircle.png",
              role: author.role || "student",
              id: author._id || null
            },
            upvoteCount: post.upvotes?.length || 0,
            downvoteCount: post.downvotes?.length || 0,
            hasUpvoted: post.upvotes?.includes(currentUserId),
            hasDownvoted: post.downvotes?.includes(currentUserId),
            comments: (post.comments || []).map(comment => {
              const commentUser = comment.user || {};
              return {
                id: comment._id,
                text: comment.text,
                author: {
                  id: commentUser._id || null,
                  name: commentUser.firstName && commentUser.lastName ? 
                    `${commentUser.firstName} ${commentUser.lastName}` : 
                    "Utilisateur inconnu",
                  username: commentUser.username || "utilisateur",
                  avatar: commentUser.profilePicture || "/src/assets/UserCircle.png"
                },
                createdAt: comment.createdAt,
                upvotes: comment.upvotes || [],
                downvotes: comment.downvotes || [],
                hasUpvoted: comment.upvotes?.includes(currentUserId),
                hasDownvoted: comment.downvotes?.includes(currentUserId),
                replies: (comment.replies || []).map(reply => {
                  const replyUser = reply.user || {};
                  return {
                    id: reply._id,
                    text: reply.text,
                    author: {
                      id: replyUser._id || null,
                      name: replyUser.firstName && replyUser.lastName ? 
                        `${replyUser.firstName} ${replyUser.lastName}` : 
                        "Utilisateur inconnu",
                      username: replyUser.username || "utilisateur",
                      avatar: replyUser.profilePicture || "/src/assets/UserCircle.png"
                    },
                    createdAt: reply.createdAt,
                    upvotes: reply.upvotes || [],
                    downvotes: reply.downvotes || [],
                    hasUpvoted: reply.upvotes?.includes(currentUserId),
                    hasDownvoted: reply.downvotes?.includes(currentUserId)
                  }
                })
              }
            }),
            createdAt: post.createdAt,
            isSaved: post.isSaved || false,
          }
        })
        setPosts(mappedPosts)
      } catch (err) {
        console.error("Error fetching posts:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const handleImageClick = () => {
    imageInputRef.current.click()
  }

  const handleImageUrlClick = () => {
    setShowImageUrlDialog(true)
    setTimeout(() => urlInputRef.current?.focus(), 100)
  }

  const handleUrlSubmit = () => {
    if (imageUrl.trim()) {
      setMediaFile(imageUrl)
      setMediaType("image")
      setShowImageUrlDialog(false)
      setImageUrl("")
    }
  }

  const handleMediaChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaFile(reader.result)
        setMediaType(type)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveMedia = () => {
    setMediaFile(null)
    setMediaType(null)
    setImageUrl("")
    if (imageInputRef.current) imageInputRef.current.value = ""
  }

  const handlePost = async () => {
    if ((postTitle.trim() === "" || postText.trim() === "") && !mediaFile) {
      return;
    }

    try {
      setIsPosting(true);
      const token = localStorage.getItem("token");
      
      let response;
      
      // If media is from URL (string)
      if (mediaFile && typeof mediaFile === 'string' && mediaFile.startsWith('http')) {
        response = await axios.post(
          "http://localhost:5000/api/posts",
          {
            title: postTitle,
            content: postText,
            media: mediaFile,
            mediaType: "image"
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } 
      // If media is an uploaded file
      else if (mediaFile && !mediaFile.startsWith('http')) {
        const formData = new FormData();
        formData.append('title', postTitle);
        formData.append('content', postText);
        
        // Convert base64 to file
        if (mediaFile.startsWith('data:')) {
          const base64Response = await fetch(mediaFile);
          const blob = await base64Response.blob();
          const file = new File([blob], "image.jpg", { type: "image/jpeg" });
          formData.append('media', file);
        }
        
        response = await axios.post(
          "http://localhost:5000/api/posts",
          formData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
      } 
      // If no media
      else {
        response = await axios.post(
          "http://localhost:5000/api/posts",
          {
            title: postTitle,
            content: postText
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.status === 201 || response.status === 200) {
        // Reset form
        setPostTitle("");
        setPostText("");
        setMediaFile(null);
        setMediaType(null);
        setIsExpanded(false);
        if (imageInputRef.current) imageInputRef.current.value = "";

        // Refresh posts
        const refreshResponse = await axios.get("http://localhost:5000/api/posts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const currentUserId = localStorage.getItem("userId");
        const mappedPosts = refreshResponse.data.posts.map(post => {
          const author = post.author || {};
          return {
            _id: post._id,
            title: post.title,
            content: post.content,
            media: post.media,
            mediaType: post.mediaType,
            author: {
              name: author.firstName && author.lastName ? 
                `${author.firstName} ${author.lastName}` : 
                "Utilisateur inconnu",
              username: author.username || "utilisateur",
              avatar: author.profilePicture || "/src/assets/UserCircle.png",
              role: author.role || "student",
              id: author._id || null
            },
            upvoteCount: post.upvotes?.length || 0,
            downvoteCount: post.downvotes?.length || 0,
            hasUpvoted: post.upvotes?.includes(currentUserId),
            hasDownvoted: post.downvotes?.includes(currentUserId),
            comments: [],
            createdAt: post.createdAt,
            isSaved: post.isSaved || false,
          };
        });

        setPosts(mappedPosts);

        // Show success notification
        const notification = document.createElement("div");
        notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center";
        notification.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Publication créée avec succès!</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add("opacity-0", "transition-opacity", "duration-500");
          setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);
      }
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Erreur lors de la création de la publication");
    } finally {
      setIsPosting(false);
      if (postButtonRef.current) {
        postButtonRef.current.style.backgroundColor = "#3ddc97";
        postButtonRef.current.style.boxShadow = "0 4px 8px rgba(61, 220, 151, 0.3)";
      }
    }
  }

  const toggleExpand = () => {
    setIsExpanded(!isExpanded)
  }

  const isPostButtonDisabled = (postTitle.trim() === "" || postText.trim() === "") && !mediaFile

  return (
    <>
      <div className={`publicationcontainer ${isExpanded ? "expanded" : "collapsed"}`}>
        {!isExpanded ? (
          <div className="post-collapsed-bar" onClick={toggleExpand}>
            <span className="post-collapsed-text">Faite entendre votre écho...</span>
          </div>
        ) : (
          <div className="post-input-area">
            <input
              type="text"
              className="post-title-input"
              value={postTitle}
              onChange={(e) => setPostTitle(e.target.value)}
              placeholder="Titre de votre publication..."
              autoFocus
            />

            <textarea
              className="post-textarea"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              placeholder="Contenu de votre publication..."
            />

            {mediaFile && (
              <div className="media-preview">
                <img src={mediaFile} alt="Preview" className="max-h-64 rounded-lg" />
                <button className="remove-media" onClick={handleRemoveMedia}>
                  ×
                </button>
              </div>
            )}

            <div className="post-actions">
              <div className="media-buttons">
                <button className="media-button" onClick={handleImageClick}>
                  <img src="/src/assets/Gallery.png" alt="Gallery" />
                  <span>Image</span>
                </button>
                <button className="media-button" onClick={handleImageUrlClick}>
                  <Paperclip className="text-gray-600 w-6 h-6" />
                  <span>Image URL</span>
                </button>
              </div>

              <div className="post-buttons">
                <button className="cancel-post-button" onClick={toggleExpand}>
                  Annuler
                </button>
                <button
                  ref={postButtonRef}
                  className={`post-button ${isPosting ? "posting" : ""}`}
                  onClick={handlePost}
                  disabled={isPostButtonDisabled}
                  style={{ transition: "all 0.3s ease" }}
                >
                  Publier
                </button>
              </div>
            </div>

            {/* Add this hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              className="hidden"
              onChange={(e) => handleMediaChange(e, "image")}
            />
          </div>
        )}
      </div>

      {showImageUrlDialog && (
        <div className="url-input-container">
          <div className="url-dialog">
            <div className="dialog-header">
              <h3 className="text-lg font-semibold">Insérer une image depuis une URL</h3>
              <button onClick={() => setShowImageUrlDialog(false)}>×</button>
            </div>

            <div className="dialog-content">
              <input
                ref={urlInputRef}
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
                className="url-input"
              />

              {imageUrl && (
                <div className="image-preview">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = "/placeholder.svg"
                    }}
                  />
                </div>
              )}
            </div>

            <div className="dialog-actions">
              <button onClick={() => setShowImageUrlDialog(false)}>
                Annuler
              </button>
              <button
                onClick={handleUrlSubmit}
                disabled={!imageUrl.trim()}
                className="submit-button"
              >
                Insérer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="messages-container">
        {posts.map((post) => (
          <AjoutPub
            key={post._id}
            postId={post._id}
            title={post.title}
            content={post.content}
            media={post.media}
            mediaType={post.mediaType}
            author={post.author}
            upvoteCount={post.upvoteCount}
            downvoteCount={post.downvoteCount}
            commentCount={post.commentCount}
            createdAt={post.createdAt}
            comments={post.comments}
            hasUpvoted={post.hasUpvoted}
            hasDownvoted={post.hasDownvoted}
            isSaved={post.isSaved} // Add this prop
          />
        ))}
      </div>
    </>
  )
}

export default Publication
