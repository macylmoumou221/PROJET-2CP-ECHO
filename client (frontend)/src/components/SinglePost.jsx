"use client"

import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import axios from "axios"
import AjoutPub from "./AjoutPub"
import Comment from "./Comment"
import "./SinglePost.css"

const SinglePost = () => {
  const { postId } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState("")
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  // Fetch current user data from backend
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setCurrentUser(response.data.user)
      } catch (err) {
        console.error("Error fetching current user:", err)
      }
    }

    fetchCurrentUser()
  }, [])

  // Fetch post data from backend
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const postData = response.data
        const currentUserId = localStorage.getItem("userId")

        // Map the post data to match Publication.jsx structure
        const mappedPost = {
          _id: postData._id,
          title: postData.title,
          content: postData.content,
          media: postData.media,
          mediaType: postData.mediaType,
          author: {
            name:
              postData.author?.firstName && postData.author?.lastName
                ? `${postData.author.firstName} ${postData.author.lastName}`
                : "Utilisateur inconnu",
            username: postData.author?.username || "utilisateur",
            avatar: postData.author?.profilePicture || "/src/assets/UserCircle.png",
            role: postData.author?.role || "student",
            id: postData.author?._id || null,
          },
          upvoteCount: postData.upvotes?.length || 0,
          downvoteCount: postData.downvotes?.length || 0,
          hasUpvoted: postData.upvotes?.includes(currentUserId),
          hasDownvoted: postData.downvotes?.includes(currentUserId),
          comments: (postData.comments || []).map((comment) => ({
            id: comment._id,
            text: comment.text,
            author: {
              id: comment.user?._id || null,
              name:
                comment.user?.firstName && comment.user?.lastName
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : "Utilisateur inconnu",
              username: comment.user?.username || "utilisateur",
              avatar: comment.user?.profilePicture || "/src/assets/UserCircle.png",
            },
            createdAt: comment.createdAt,
            upvotes: comment.upvotes || [],
            downvotes: comment.downvotes || [],
            hasUpvoted: comment.upvotes?.includes(currentUserId),
            hasDownvoted: comment.downvotes?.includes(currentUserId),
            replies: (comment.replies || []).map((reply) => ({
              id: reply._id,
              text: reply.text,
              author: {
                id: reply.user?._id || null,
                name:
                  reply.user?.firstName && reply.user?.lastName
                    ? `${reply.user.firstName} ${reply.user.lastName}`
                    : "Utilisateur inconnu",
                username: reply.user?.username || "utilisateur",
                avatar: reply.user?.profilePicture || "/src/assets/UserCircle.png",
              },
              createdAt: reply.createdAt,
              upvotes: reply.upvotes || [],
              downvotes: reply.downvotes || [],
              hasUpvoted: reply.upvotes?.includes(currentUserId),
              hasDownvoted: reply.downvotes?.includes(currentUserId),
            })),
          })),
          createdAt: postData.createdAt,
          isSaved: postData.isSaved || false,
        }

        setPost(mappedPost)
        setComments(mappedPost.comments)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching post:", err)
        setLoading(false)
      }
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const handleAddComment = (e) => {
    e.preventDefault()
    if (newComment.trim() === "") return

    const comment = {
      id: Date.now(),
      text: newComment,
      author: "Utilisateur",
      avatar: "/src/assets/UserCircle.png",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      dislikes: 0,
      replies: [],
      isLiked: null,
    }

    setComments([...comments, comment])
    setNewComment("")
  }

  const handleReply = (commentId, replyText) => {
    const reply = {
      id: Date.now(),
      text: replyText,
      author: "Utilisateur",
      avatar: "/src/assets/UserCircle.png",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      likes: 0,
      dislikes: 0,
      isLiked: null,
    }

    const updatedComments = comments.map((comment) => {
      if (comment.id === commentId) {
        return {
          ...comment,
          replies: [...comment.replies, reply],
        }
      }
      return comment
    })

    setComments(updatedComments)
  }

  const handleCommentVote = (commentId, voteType, isReply = false, parentId = null) => {
    if (isReply && parentId) {
      // Handle voting on replies
      const updatedComments = comments.map((comment) => {
        if (comment.id === parentId) {
          const updatedReplies = comment.replies.map((reply) => {
            if (reply.id === commentId) {
              let newLikes = reply.likes
              let newDislikes = reply.dislikes
              let newIsLiked = reply.isLiked

              if (voteType === "like") {
                if (reply.isLiked === "like") {
                  // Unlike
                  newLikes--
                  newIsLiked = null
                } else if (reply.isLiked === "dislike") {
                  // Change from dislike to like
                  newLikes++
                  newDislikes--
                  newIsLiked = "like"
                } else {
                  // New like
                  newLikes++
                  newIsLiked = "like"
                }
              } else {
                if (reply.isLiked === "dislike") {
                  // Undislike
                  newDislikes--
                  newIsLiked = null
                } else if (reply.isLiked === "like") {
                  // Change from like to dislike
                  newLikes--
                  newDislikes++
                  newIsLiked = "dislike"
                } else {
                  // New dislike
                  newDislikes++
                  newIsLiked = "dislike"
                }
              }

              return {
                ...reply,
                likes: newLikes,
                dislikes: newDislikes,
                isLiked: newIsLiked,
              }
            }
            return reply
          })

          return {
            ...comment,
            replies: updatedReplies,
          }
        }
        return comment
      })

      setComments(updatedComments)
    } else {
      // Handle voting on main comments
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          let newLikes = comment.likes
          let newDislikes = comment.dislikes
          let newIsLiked = comment.isLiked

          if (voteType === "like") {
            if (comment.isLiked === "like") {
              // Unlike
              newLikes--
              newIsLiked = null
            } else if (comment.isLiked === "dislike") {
              // Change from dislike to like
              newLikes++
              newDislikes--
              newIsLiked = "like"
            } else {
              // New like
              newLikes++
              newIsLiked = "like"
            }
          } else {
            if (comment.isLiked === "dislike") {
              // Undislike
              newDislikes--
              newIsLiked = null
            } else if (comment.isLiked === "like") {
              // Change from like to dislike
              newLikes--
              newDislikes++
              newIsLiked = "dislike"
            } else {
              // New dislike
              newDislikes++
              newIsLiked = "dislike"
            }
          }

          return {
            ...comment,
            likes: newLikes,
            dislikes: newDislikes,
            isLiked: newIsLiked,
          }
        }
        return comment
      })

      setComments(updatedComments)
    }
  }

  return (
    <div className="single-post-container">
      <div className="single-post-header">
        <button onClick={() => navigate(-1)} className="back-button">
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
            <path d="M19 12H5"></path>
            <path d="M12 19l-7-7 7-7"></path>
          </svg>
          Retour
        </button>
        <h1>Publication</h1>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="loading-spinner"></div>
          <p>Chargement de la publication...</p>
        </div>
      ) : post ? (
        <div className="single-post-content">
          <AjoutPub
            postId={post._id}
            title={post.title}
            content={post.content}
            media={post.media}
            mediaType={post.mediaType}
            author={post.author}
            upvoteCount={post.upvoteCount}
            downvoteCount={post.downvoteCount}
            commentCount={post.comments?.length || 0}
            createdAt={post.createdAt}
            comments={post.comments}
            hasUpvoted={post.hasUpvoted}
            hasDownvoted={post.hasDownvoted}
            isSaved={post.isSaved}
            isFullPost={true}
          />
        </div>
      ) : (
        <div className="post-not-found">
          <h2>Publication non trouvée</h2>
          <p>La publication que vous recherchez n'existe pas ou a été supprimée.</p>
          <Link to="/accueil" className="back-home-button">
            Retour à l'accueil
          </Link>
        </div>
      )}
    </div>
  )
}

export default SinglePost
