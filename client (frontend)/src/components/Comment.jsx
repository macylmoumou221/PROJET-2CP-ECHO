"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Shield, Briefcase, GraduationCap } from "lucide-react"
import "./Comment.css"
import axios from "axios"

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return ""; // Handle undefined timestamp
  
  const now = new Date();
  const past = new Date(timestamp);
  
  // Check if the date is valid
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

const Comment = ({ comment, onReply, onVote, currentUserId, currentUser, postId }) => {
  const navigate = useNavigate()
  const [replyText, setReplyText] = useState("")
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [showReplies, setShowReplies] = useState(false)
  const [showReplyUserInfo, setShowReplyUserInfo] = useState(null)

  // Update initial vote state to use comment's vote status
  const [voteState, setVoteState] = useState({
    upvoted: comment.hasUpvoted || false,
    downvoted: comment.hasDownvoted || false,
    voteCount: (comment.upvotes?.length || 0) - (comment.downvotes?.length || 0)
  });

  const calculateVoteCount = (upvotes = [], downvotes = []) => {
    // Ensure we're working with arrays and get their lengths
    return (Array.isArray(upvotes) ? upvotes.length : 0) - 
           (Array.isArray(downvotes) ? downvotes.length : 0);
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (replyText.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      await axios.post(
        `http://localhost:5000/api/posts/${postId}/comments/${comment.id}/replies`,
        { text: replyText },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Fetch updated comment data after posting reply
      const response = await axios.get(
        `http://localhost:5000/api/posts/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Find the updated comment in the response
      const updatedComment = response.data.comments.find(c => c._id === comment.id);
      if (updatedComment) {
        // Format the reply data
        const formattedReplies = updatedComment.replies.map(reply => ({
          id: reply._id,
          text: reply.text,
          author: {
            id: reply.user._id,
            name: reply.user.firstName + ' ' + reply.user.lastName,
            username: reply.user.username,
            avatar: reply.user.profilePicture
          },
          createdAt: reply.createdAt,
          upvotes: reply.upvotes || [],
          downvotes: reply.downvotes || [],
          hasUpvoted: reply.upvotes?.includes(currentUserId),
          hasDownvoted: reply.downvotes?.includes(currentUserId)
        }));

        // Pass the formatted replies to onReply
        onReply(comment.id, formattedReplies);
      }

      // Reset form
      setReplyText("");
      setShowReplyForm(false);
      setShowReplies(true);
    } catch (err) {
      console.error("Error adding reply:", err);
      alert("Error adding reply");
    }
  };

  const toggleReplyForm = () => {
    setShowReplyForm(!showReplyForm)
    if (!showReplyForm && !showReplies && comment.replies.length > 0) {
      setShowReplies(true)
    }
  }

  const toggleReplies = () => {
    setShowReplies(!showReplies)
  }

  const handleVote = async (type) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const endpoint = `http://localhost:5000/api/posts/${postId}/comments/${comment.id}/${type}`;
      console.log('Vote endpoint:', endpoint);

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Vote response:', response.data);

      // Update state based on exact response data
      setVoteState({
        upvoted: response.data.hasUpvoted,
        downvoted: response.data.hasDownvoted,
        voteCount: response.data.upvotes.length - response.data.downvotes.length
      });

      // Remove the onVote callback - we'll handle state updates locally only
      // onVote(comment.id, type);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  const handleReplyVote = async (replyId, type) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const endpoint = `http://localhost:5000/api/posts/${postId}/comments/${comment.id}/replies/${replyId}/${type}`;
      console.log('Reply vote endpoint:', endpoint);

      const response = await axios.post(
        endpoint,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Reply vote response:', response.data);

      // Remove the onVote callback - we'll handle state updates locally only
      // onVote(replyId, type, true, comment.id);
    } catch (err) {
      console.error("Error voting:", err);
    }
  };

  return (
    <div className="comment">
      <div className="comment-main">
        <div 
          className="cursor-pointer group relative"
          onClick={() => navigate(`/profile/${comment.author.id}`)}
        >
          {comment.author?.avatar ? (
            <img 
              src={comment.author.avatar || "/placeholder.svg"} 
              alt={comment.author.name} 
              className="w-8 h-8 rounded-full object-cover ring-2 ring-offset-2 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-2 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4">
              {comment.author?.name?.charAt(0) || "U"}
            </div>
          )}
        </div>

        <div className="comment-content">
          <div className="comment-header flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="comment-author font-medium">{comment.author?.name}</span>
              <span className="text-sm text-[#3DDC97]">@{comment.author?.username}</span>
            </div>
            <span className="comment-timestamp text-gray-500 text-sm">
              {formatTimeAgo(comment.createdAt)}
            </span>
          </div>

          <p className="comment-text">{comment.text}</p>

          <div className="comment-actions">
            <div className="flex items-center gap-4">
              <div className="vote-buttons flex items-center gap-2">
                <button 
                  className={`vote-button transform transition-transform hover:scale-110`}
                  onClick={() => handleVote('upvote')} // Changed from 'like' to 'upvote'
                >
                  <img
                    src={voteState.upvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png"}
                    alt="Upvote"
                    className="w-5 h-5"
                  />
                </button>

                <span className={`vote-count font-medium ${
                  voteState.upvoted ? 'text-[#3DDC97]' : 
                  voteState.downvoted ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {calculateVoteCount(comment.upvotes, comment.downvotes)}
                </span>

                <button 
                  className={`vote-button transform transition-transform hover:scale-110`}
                  onClick={() => handleVote('downvote')} // Changed from 'dislike' to 'downvote'
                >
                  <img
                    src={voteState.downvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png"}
                    alt="Downvote"
                    className="w-5 h-5"
                  />
                </button>
              </div>
              
              <button 
                className="reply-button text-gray-500 hover:text-[#3DDC97] transition-colors"
                onClick={toggleReplyForm}
              >
                Répondre
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <form className="reply-form" onSubmit={handleSubmitReply}>
          {currentUser?.profilePicture ? (
            <img
              src={currentUser.profilePicture || "/placeholder.svg"}
              alt={currentUser.firstName}
              className="reply-avatar"
            />
          ) : (
            <div className="reply-avatar flex items-center justify-center bg-gray-200 text-gray-600 font-semibold">
              {currentUser?.firstName?.charAt(0) || "U"}
            </div>
          )}
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Écrire une réponse..."
            className="reply-input"
            autoFocus
          />
          <div className="reply-buttons">
            <button type="button" className="reply-cancel" onClick={() => setShowReplyForm(false)}>
              Annuler
            </button>
            <button type="submit" className="reply-submit" disabled={!replyText.trim()}>
              Répondre
            </button>
          </div>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="replies-section">
          <button className="toggle-replies" onClick={toggleReplies}>
            {showReplies ? "Masquer" : "Afficher"} les réponses ({comment.replies.length})
          </button>

          {showReplies && (
            <div className="replies-list">
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply">
                  <div 
                    className="cursor-pointer group relative"
                    onClick={() => navigate(`/profile/${reply.author.id}`)}
                  >
                    {reply.author?.avatar ? (
                      <img 
                        src={reply.author.avatar} 
                        alt={reply.author.name} 
                        className="w-6 h-6 rounded-full object-cover ring-2 ring-offset-1 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-offset-1 ring-[#3ddc97] transition-all duration-300 group-hover:ring-4">
                        {reply.author?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>

                  <div className="reply-content">
                    <div className="reply-header flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="reply-author font-medium">{reply.author?.name}</span>
                        <span className="text-sm text-[#3DDC97]">@{reply.author?.username}</span>
                      </div>
                      <span className="reply-timestamp text-gray-500 text-sm">
                        {formatTimeAgo(reply.createdAt)} {/* Use createdAt instead of timestamp */}
                      </span>
                    </div>

                    <p className="reply-text">{reply.text}</p>

                    <div className="reply-actions">
                      <div className="vote-buttons flex items-center gap-2">
                        <button 
                          className={`vote-button transform transition-transform hover:scale-110 ${
                            reply.hasUpvoted ? 'active-vote' : ''
                          }`}
                          onClick={() => handleReplyVote(reply.id, 'upvote')} // Changed from 'like' to 'upvote'
                        >
                          <img
                            src={reply.hasUpvoted ? "/src/icons/DoubleAltArrowUp2.png" : "/src/icons/DoubleAltArrowUp.png"}
                            alt="Upvote"
                            className="w-4 h-4"
                          />
                        </button>

                        <span className={`vote-count text-xs font-medium ${
                          reply.hasUpvoted ? 'text-[#3DDC97]' : 
                          reply.hasDownvoted ? 'text-red-500' : 'text-gray-600'
                        }`}>
                          {calculateVoteCount(reply.upvotes, reply.downvotes)}
                        </span>

                        <button 
                          className={`vote-button transform transition-transform hover:scale-110 ${
                            reply.hasDownvoted ? 'text-red-500' : 'text-gray-500'
                          }`}
                          onClick={() => handleReplyVote(reply.id, 'downvote')} // Changed from 'dislike' to 'downvote'
                        >
                          <img
                            src={reply.hasDownvoted ? "/src/icons/DoubleAltArrowDown2.png" : "/src/icons/DoubleAltArrowDown.png"}
                            alt="Downvote"
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Comment
