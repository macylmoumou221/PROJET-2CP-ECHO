"use client"

import { useState, useEffect, useRef } from "react"
import { Shield, Briefcase, GraduationCap } from "lucide-react" // Changed to lucide-react
import "./AjoutPub.css"
import Comment from "./Comment"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { getImageUrl } from '../utils/imageUtils';
import { useReportDialog } from '../contexts/ReportDialogContext';

// Add this function at the top of the file, after the imports
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return "";
  
  const now = new Date();
  const past = new Date(timestamp);
  
  if (isNaN(past.getTime())) {
    return "Date invalide";
  }

  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) return 'À l\'instant';
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} ${hours === 1 ? 'heure' : 'heures'}`;
  }
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `Il y a ${days} ${days === 1 ? 'jour' : 'jours'}`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `Il y a ${months} ${months === 1 ? 'mois' : 'mois'}`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `Il y a ${years} ${years === 1 ? 'an' : 'ans'}`;
};

const AjoutPub = ({ 
  title, 
  content, 
  media, 
  mediaType, 
  author, 
  postId,
  isSaved: initialIsSaved, // Add this prop
  upvoteCount = 0, 
  downvoteCount = 0, 
  createdAt,
  comments = [],
  isFullPost = false,
  hasUpvoted = false,
  hasDownvoted = false,
}) => {
  const navigate = useNavigate()
  const { openReportDialog } = useReportDialog();
  const [afficher, setAfficher] = useState(false)
  const [texteCourt, setTexteCourt] = useState("")
  const [depassement, setDepassement] = useState(false)
  const [i, setI] = useState(upvoteCount) // Initialize with passed upvoteCount
  const [j, setJ] = useState(downvoteCount) // Initialize with passed downvoteCount
  const [k, setK] = useState(upvoteCount - downvoteCount) // Initialize difference
  const [vote, setVote] = useState(hasUpvoted ? "like" : hasDownvoted ? "dislike" : null) // 'like', 'dislike', or null
  const [img1, setimg1] = useState(hasUpvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png")
  const [img2, setimg2] = useState(hasDownvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png")
  const [showComments, setShowComments] = useState(isFullPost) // Auto-show comments in full post view
  const [newComment, setNewComment] = useState("")
  const commentInputRef = useRef(null)
  const [isSaved, setIsSaved] = useState(initialIsSaved || false) // Update the isSaved state initialization to use the prop
  const [showUserInfo, setShowUserInfo] = useState(false)
  const userProfileRef = useRef(null)
  const [currentComments, setCurrentComments] = useState(comments)
  const [currentUser, setCurrentUser] = useState(null);
  const [isReported, setIsReported] = useState(false) // Add reported state

  const handlePostClick = (e) => {
    // Only navigate if not clicking on interactive elements
    if (
      !e.target.closest(".user-profile") &&
      !e.target.closest(".post-actions-header") &&
      !e.target.closest(".commentaire") &&
      !e.target.closest(".comments-section") &&
      !isFullPost
    ) {
      navigate(`/post/${postId}`)
    }
  }

  const handleLike = async (e) => {
    e.stopPropagation()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/upvote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setI(response.data.upvotes)
      setJ(response.data.downvotes)
      setVote(response.data.hasUpvoted ? "like" : null)
      setimg1(response.data.hasUpvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png")
      setimg2("/src/icons/DoubleAltArrowDown.png")
    } catch (err) {
      console.error("Error upvoting post:", err)
    }
  }

  const handleDislike = async (e) => {
    e.stopPropagation()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/downvote`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      setI(response.data.upvotes)
      setJ(response.data.downvotes)
      setVote(response.data.hasDownvoted ? "dislike" : null)
      setimg2(response.data.hasDownvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png")
      setimg1("/src/icons/DoubleAltArrowUp.png")
    } catch (err) {
      console.error("Error downvoting post:", err)
    }
  }

  // Modify the report click handler
  const handleReportClick = async (e) => {
    e.stopPropagation();
    if (isReported) return; // Prevent multiple reports

    openReportDialog(postId, async (reason) => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await axios.post(
          `http://localhost:5000/api/posts/${postId}/report`,
          { reason },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        setIsReported(true); // Mark as reported

        const notification = document.createElement("div");
        notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center";
        notification.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Publication signalée avec succès</span>
        `;
        document.body.appendChild(notification);
        setTimeout(() => {
          notification.classList.add("opacity-0", "transition-opacity", "duration-500");
          setTimeout(() => document.body.removeChild(notification), 500);
        }, 3000);

      } catch (err) {
        console.error("Error reporting post:", err);
      }
    });
  }

  const toggleComments = (e) => {
    e.stopPropagation() // Prevent post click navigation
    setShowComments(!showComments)
    if (!showComments) {
      setTimeout(() => {
        commentInputRef.current?.focus()
      }, 100)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (newComment.trim() === "") return

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      const response = await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments`,
        { text: newComment },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      const newCommentData = response.data.comments[0]
      const formattedComment = {
        id: newCommentData._id,
        text: newCommentData.text,
        author: {
          id: newCommentData.user._id,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          username: currentUser.username,
          avatar: currentUser.profilePicture
        },
        createdAt: newCommentData.createdAt,
        upvotes: newCommentData.upvotes,
        downvotes: newCommentData.downvotes,
        hasUpvoted: false,
        hasDownvoted: false,
        replies: []
      }

      setCurrentComments(prev => [formattedComment, ...prev])
      setNewComment("")
    } catch (err) {
      console.error("Error adding comment:", err)
      alert("Error adding comment")
    }
  }

  const handleReply = (commentId, updatedReplies) => {
    setCurrentComments(prevComments => 
      prevComments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: Array.isArray(updatedReplies) ? updatedReplies : [updatedReplies]
          };
        }
        return comment;
      })
    );
  }

  const handleCommentVote = async (commentId, voteType, isReply = false, parentId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      console.log(`Attempting to ${voteType} ${isReply ? 'reply' : 'comment'}:`, commentId);

      const vote = voteType === 'like' ? 'upvote' : 'downvote';
      const endpoint = isReply 
        ? `http://localhost:5000/api/posts/${postId}/comments/${parentId}/replies/${commentId}/${vote}`
        : `http://localhost:5000/api/posts/${postId}/comments/${commentId}/${vote}`;

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Vote response:', response.data);

      // Update comments state with new vote data
      setCurrentComments(prevComments => 
        prevComments.map(comment => {
          if (isReply && comment.id === parentId) {
            return {
              ...comment,
              replies: comment.replies.map(reply => {
                if (reply.id === commentId) {
                  const newReply = {
                    ...reply,
                    upvotes: response.data.upvotes || [],
                    downvotes: response.data.downvotes || [],
                    hasUpvoted: response.data.hasUpvoted || false,
                    hasDownvoted: response.data.hasDownvoted || false
                  };
                  console.log('Updated reply:', newReply);
                  return newReply;
                }
                return reply;
              })
            };
          }
          if (!isReply && comment.id === commentId) {
            const newComment = {
              ...comment,
              upvotes: response.data.upvotes || [],
              downvotes: response.data.downvotes || [],
              hasUpvoted: response.data.hasUpvoted || false,
              hasDownvoted: response.data.hasDownvoted || false
            };
            console.log('Updated comment:', newComment);
            return newComment;
          }
          return comment;
        })
      );
    } catch (err) {
      console.error("Error voting:", err);
    }
  }

  // Update the user profile hover functionality
  const handleUserProfileMouseEnter = (e) => {
    e.stopPropagation()
    setShowUserInfo(true)
  }

  const handleMouseLeave = (e) => {
    e.stopPropagation()
    // Add delay to check if cursor is over popup
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget?.closest('.user-info-popup')) {
      setTimeout(() => {
        if (!document.querySelector('.user-info-popup:hover')) {
          setShowUserInfo(false)
        }
      }, 300) // Increased delay to 300ms
    }
  }

  const handleUserProfileClick = (e) => {
    e.stopPropagation()
    navigate(`/profile/${author.id}`)
  }

  useEffect(() => {
    setK(i - j)
  }, [i, j])

  useEffect(() => {
    if (content && content.length > 200) { // Changed from description to content
      setTexteCourt(content.slice(0, 200))
      setDepassement(true)
    } else {
      setTexteCourt(content || "")
    }
  }, [content]) // Changed dependency from description to content

  const handleSaveClick = async (e) => {
    e.stopPropagation()
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Authentication required")
        return
      }

      // If post is already saved, send DELETE request to unsave
      if (isSaved) {
        await axios.delete(`http://localhost:5000/api/users/saved/posts/${postId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } else {
        // If post is not saved, send POST request to save
        await axios.post(`http://localhost:5000/api/users/saved/posts/${postId}`, {}, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      }

      // Toggle saved state
      setIsSaved(prev => !prev)

      // Show success notification with appropriate message
      const notification = document.createElement("div")
      notification.className = "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
      notification.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        <span>${isSaved ? 'Publication retirée des favoris' : 'Publication ajoutée aux favoris'}</span>
      `
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => document.body.removeChild(notification), 500)
      }, 3000)

    } catch (err) {
      console.error("Error toggling saved state:", err)
      setIsSaved(prev => !prev) // Revert on error
      alert(isSaved ? "Erreur lors du retrait des favoris" : "Erreur lors de l'ajout aux favoris")
    }
  }

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Extract only needed fields from response
        const { 
          _id,
          firstName,
          lastName,
          username,
          role,
          profilePicture
        } = response.data;

        setCurrentUser({
          id: _id,
          firstName,
          lastName,
          username,
          role,
          profilePicture
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const userRoleConfig = {
    student: {
      icon: <GraduationCap size={14} className="mr-1" />,
      label: "Étudiant"
    },
    teacher: {
      icon: <Briefcase size={14} className="mr-1" />,
      label: "Enseignant"
    },
    admin: {
      icon: <Shield size={14} className="mr-1" />,
      label: "Administrateur"
    }
  }

  return (
    <div className={`ajoutpub ${isFullPost ? "full-post" : ""}`} onClick={handlePostClick}>
      <div className="header flex items-center justify-between">
        <div
          className="user-profile flex items-center gap-3 group relative"
          onMouseEnter={handleUserProfileMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={handleUserProfileClick}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              {author?.avatar ? (
                <img 
                  src={getImageUrl(author.avatar)}
                  alt={author.name} 
                  className="w-10 h-10 rounded-full object-cover border-2 border-[#3DDC97] group-hover:border-[#32c285] transition-colors"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/src/assets/UserCircle.png";
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#3DDC97] to-[#32c285] flex items-center justify-center text-white font-semibold">
                  {author?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-gray-800 font-medium leading-tight">{author?.name || "Utilisateur"}</span>
              <span className="text-[#3DDC97] text-sm leading-tight">@{author?.username || "utilisateur"}</span>
            </div>
          </div>
          {showUserInfo && (
            <div
              className="user-info-popup absolute hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/profile/${author.id}`);
              }}
              onMouseEnter={() => setShowUserInfo(true)}
              onMouseLeave={(e) => {
                e.stopPropagation();
                setTimeout(() => setShowUserInfo(false), 300)
              }}
              style={{
                zIndex: 1000,
                minWidth: '250px',
                maxWidth: '300px',
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(229, 231, 235, 1)',
                padding: '1rem',
                cursor: 'pointer',
                top: '100%',
                left: '0',
                transform: 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
            >
              <div className="flex items-start gap-4 group transition-transform duration-300 hover:scale-105">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#3DDC97]">
                  {author?.avatar ? (
                    <img 
                      src={author.avatar || "/placeholder.svg"} 
                      alt={author.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-600 font-semibold">
                      {author?.name?.charAt(0) || "U"}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{author?.name || "Utilisateur"}</h3>
                  <p className="text-[#3DDC97] font-medium">@{author?.username || "utilisateur"}</p>
                  <div className="mt-2">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#3DDC97] to-white">
                      {userRoleConfig[author?.role]?.icon}
                      <span className="text-gray-800 text-sm ml-1">{userRoleConfig[author?.role]?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-gray-100">
                <button className="text-sm text-gray-600 hover:text-[#3DDC97] transition-colors">
                  Voir le profil
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="post-actions-header flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
          <span className="text-gray-500 text-sm">
            {formatTimeAgo(createdAt)}
          </span>
          <img 
            src="/src/assets/Danger.png" 
            alt="Danger" 
            className={`Danger ${isReported ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={!isReported ? handleReportClick : undefined} 
          />
        </div>
      </div>

      <div className="post-content">
        <h2 className="post-title">{title}</h2>
        <p className="post-description">
          {!afficher && depassement ? (
            <>
              {texteCourt}...
              <span className="toggle" onClick={(e) => e.stopPropagation() || setAfficher(true)}>
                ...plus
              </span>
            </>
          ) : (
            <>
              {content}
              {depassement && (
                <button className="toggle-block" onClick={(e) => e.stopPropagation() || setAfficher(false)}>
                  moins
                </button>
              )}
            </>
          )}
        </p>
        {media && mediaType === "image" && (
          <div className="image-container">
            <img 
              src={media} 
              alt="Post content" 
              className="post-media"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/placeholder.svg";
              }}
            />
          </div>
        )}
      </div>

      <div className="commentaire" onClick={(e) => e.stopPropagation()}>
        <div className="interaction-buttons">
          <div className="commentaireinput">
            <button className="DoubleAltArrow" onClick={handleLike}>
              <img src={img1 || "/placeholder.svg"} alt="Upvote" />
            </button>
            <button className="DoubleAltArrow" onClick={handleDislike}>
              <img src={img2 || "/placeholder.svg"} alt="Downvote" />
            </button>
            <span className="nblike">{k}</span>
          </div>

          <button className="CommentButton" onClick={toggleComments}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="comment-icon"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            {currentComments.length > 0 && <span className="comment-count">{currentComments.length}</span>}
          </button>
        </div>

        <div className="action-buttons">
          <button 
            onClick={handleSaveClick}
            className={`flex items-center justify-center SaveButton ${isSaved ? 'saved' : ''}`}
          >
            <img 
              src="/src/icons/Vector.png"
              alt={isSaved ? "Saved" : "Save"}
              style={{ 
                filter: isSaved ? 'invert(86%) sepia(23%) saturate(7076%) hue-rotate(359deg) brightness(105%) contrast(104%)' : 'none',
                transition: 'filter 0.3s ease'
              }}
            />
          </button>
        </div>
      </div>

      {showComments && (
        <div className="comments-section" onClick={(e) => e.stopPropagation()}>
          <div className="comments-header">
            <h3>Commentaires ({currentComments.length})</h3>
          </div>

          <form className="comment-form" onSubmit={handleAddComment}>
            {currentUser?.profilePicture ? (
              <img
                src={currentUser.profilePicture || "/placeholder.svg"}
                alt={currentUser.firstName}
                className="comment-avatar"
              />
            ) : (
              <div className="comment-avatar flex items-center justify-center bg-gray-200 text-gray-600 font-semibold">
                {currentUser?.firstName?.charAt(0) || "U"}
              </div>
            )}
            <input
              type="text"
              ref={commentInputRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire..."
              className="comment-input"
            />
            <button type="submit" className="comment-submit" disabled={!newComment.trim()}>
              Envoyer
            </button>
          </form>

          <div className="comments-list">
            {currentComments.map((comment) => (
              <Comment 
                key={comment.id} 
                comment={comment} 
                onReply={handleReply} 
                onVote={handleCommentVote} 
                currentUserId={currentUser?.id} 
                currentUser={currentUser}
                postId={postId} // Make sure this is passed
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AjoutPub
