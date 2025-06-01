"use client"

import { useState, useRef, useEffect } from "react"
import axios from "axios"
import { CheckCircle2, CheckCheck } from "lucide-react"
import "./Messagerie.css"
import socketService from "../services/socketService"
import { useParams, useNavigate, useLocation } from "react-router-dom"

const extractImageUrl = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp))/gi
  const matches = text.match(urlRegex)
  if (matches) {
    const cleanedText = text.replace(urlRegex, "").trim()
    console.log("Extracted URL:", matches[0])
    return { url: matches[0], cleanedText }
  }
  return { url: null, cleanedText: text }
}

// We're keeping the component but making it return null
const UserStatus = ({ isOnline }) => null

const TypingIndicator = ({ isTyping }) => {
  if (!isTyping) return null
  return (
    <div className="typing-indicator">
      <div className="typing-animation">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  )
}

const Messagerie = () => {
  const [contacts, setContacts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [message, setMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [mediaPreview, setMediaPreview] = useState(null)
  const [isNewMessage, setIsNewMessage] = useState(false)
  const [newMessageRecipient, setNewMessageRecipient] = useState("")
  const [recipientSuggestions, setRecipientSuggestions] = useState([])
  const fileInputRef = useRef(null)
  const messagesEndRef = useRef(null)
  const newMessageInputRef = useRef(null)
  const chatAvatarRef = useRef(null)
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimeoutRef = useRef(null)
  const navigate = useNavigate()
  const { userId } = useParams() // Get userId from URL
  const location = useLocation()

  const [mediaFile, setMediaFile] = useState(null)
  const [optimisticId, setOptimisticId] = useState(null) // Declare optimisticId variable
  const [initialMessage, setInitialMessage] = useState("") // Add new state for initial message

  const getMessageStatus = (message) => {
    if (message.isRead) {
      return "Vu"
    }
    if (message.sent) {
      return "Remis"
    }
    return ""
  }

  // Update refreshCurrentChat to be more efficient
  const refreshCurrentChat = async (contactId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/messages/${contactId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      // Map messages in a more efficient way
      const newMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sent: msg.isFromUser,
        media: msg.media,
        mediaType: msg.mediaType,
        isRead: msg.isRead,
      }))

      // Only update if there are new messages
      setSelectedContact((prev) => {
        if (
          !prev ||
          !prev.messages ||
          prev.messages.length !== newMessages.length ||
          prev.messages[prev.messages.length - 1]?.id !== newMessages[newMessages.length - 1]?.id
        ) {
          return {
            ...prev,
            messages: newMessages,
          }
        }
        return prev
      })
    } catch (err) {
      console.error("Error refreshing chat:", err)
    }
  }

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/messages/conversations", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const mappedConversations = response.data.map((conv) => ({
          id: conv.partner._id,
          name: `${conv.partner.firstName} ${conv.partner.lastName}`,
          username: conv.partner.username,
          profilePicture: conv.partner.profilePicture || "/src/assets/UserCircle.png",
          lastMessage: conv.latestMessage?.text || "",
          time: new Date(conv.latestMessage?.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          unread: conv.unreadCount,
          status: "Hors Ligne",
          isOnline: onlineUsers.has(conv.partner._id),
          messages: [],
        }))

        setConversations(mappedConversations)
        setContacts(mappedConversations)

        if (selectedContact) {
          const updatedSelectedContact = mappedConversations.find((c) => c.id === selectedContact.id)
          if (updatedSelectedContact) {
            setSelectedContact((prev) => ({
              ...updatedSelectedContact,
              messages: prev.messages, // Preserve existing messages
            }))
          }
        }
      } catch (err) {
        console.error("Error refreshing conversations:", err)
      }
    }

    fetchConversations()

    const conversationsInterval = setInterval(() => {
      fetchConversations()
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(conversationsInterval)
  }, [onlineUsers]) // Re-initialize when online users change

  const refreshConversations = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const mappedConversations = response.data.map((conv) => ({
        id: conv.partner._id,
        name: `${conv.partner.firstName} ${conv.partner.lastName}`,
        username: conv.partner.username,
        profilePicture: conv.partner.profilePicture || "/src/assets/UserCircle.png",
        lastMessage: conv.latestMessage?.text || "",
        time: new Date(conv.latestMessage?.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unread: conv.unreadCount,
        status: "Hors Ligne",
        isOnline: onlineUsers.has(conv.partner._id),
        messages: [],
      }))

      setConversations(mappedConversations)
      setContacts(mappedConversations)

      if (selectedContact) {
        const updatedSelectedContact = mappedConversations.find((c) => c.id === selectedContact.id)
        if (updatedSelectedContact) {
          setSelectedContact((prev) => ({
            ...updatedSelectedContact,
            messages: prev.messages, // Preserve existing messages
          }))
        }
      }
    } catch (err) {
      console.error("Error refreshing conversations:", err)
    }
  }

  const handleContactSelect = async (contact) => {
    try {
      // Update URL without triggering a re-render
      if (location.pathname !== `/messagerie/${contact.id}`) {
        navigate(`/messagerie/${contact.id}`, { replace: true })
      }

      const token = localStorage.getItem("token")
      const response = await axios.get(`http://localhost:5000/api/messages/${contact.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      const mappedMessages = response.data.messages.map((msg) => ({
        id: msg._id,
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sent: msg.isFromUser,
        media: msg.media,
        mediaType: msg.mediaType,
        isRead: msg.isRead,
      }))

      setSelectedContact({
        ...contact,
        messages: mappedMessages,
      })

      setIsNewMessage(false)

      // Update unread count in contacts list
      if (contact.unread > 0) {
        setContacts((prev) =>
          prev.map((c) => (c.id === contact.id ? { ...c, unread: 0 } : c)),
        )
      }

      // Scroll to bottom after a short delay
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
    } catch (err) {
      console.error("Error fetching messages:", err)
    }
  }

  const renderMessages = () => {
    if (!selectedContact?.messages) return null

    return (
      <div className="messages-content">
        {selectedContact.messages.map((msg, index, array) => renderMessage(msg, index, index === array.length - 1))}
      </div>
    )
  }

  const renderMessage = (msg, index, isLatestMessage) => (
    <div key={`${msg.id}-${index}`} className={`message-wrapper ${msg.sent ? "sent" : "received"}`}>
      <div className={`message ${msg.sent ? "message-sent" : "message-received"}`}>
        <div className="message-content">
          {msg.text && <div className="message-text">{msg.text}</div>}
          {msg.media && (
            <div className="message-media">
              <img
                src={msg.media || "/placeholder.svg"}
                alt="Attachment"
                className="max-w-full rounded-lg"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = "/src/assets/UserCircle.png"
                }}
              />
            </div>
          )}
        </div>
      </div>
      {isLatestMessage && msg.sent && (
        <div className="message-status">
          {msg.isRead ? (
            <CheckCheck className="h-4 w-4 text-[#3DDC97]" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
          )}
        </div>
      )}
    </div>
  )

  const handleAttachment = (e) => {
    e.preventDefault()
    e.stopPropagation()
    // Create a new file input each time
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "image/*,video/*"
    input.onchange = handleFileChange
    input.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Store the file object
    setMediaFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleMessageInput = (e) => {
    setMessage(e.target.value)

    if (selectedContact) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      socketService.sendTyping(selectedContact.id)

      typingTimeoutRef.current = setTimeout(() => {
        if (socketService.isConnected()) {
          // Add connection check
          socketService.sendStopTyping(selectedContact.id)
        }
      }, 1000)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleSendMessage = async () => {
    if (message.trim() === "" && !mediaFile && !mediaPreview) return

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()

      // Add message text
      formData.append("text", message.trim())

      // Add media file if exists
      if (mediaFile) {
        formData.append("media", mediaFile)
      }

      // Create optimistic message
      const newOptimisticId = Date.now().toString()
      setOptimisticId(newOptimisticId) // Set optimisticId before using it
      const optimisticMessage = {
        id: newOptimisticId,
        text: message,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        sent: true,
        media: mediaPreview,
        mediaType: mediaFile?.type?.startsWith("image/") ? "image" : "video",
        isRead: false,
      }

      // Update UI immediately
      setSelectedContact((prev) => ({
        ...prev,
        messages: [...(prev?.messages || []), optimisticMessage],
      }))

      // Send the message
      const response = await axios.post(`http://localhost:5000/api/messages/${selectedContact.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data) {
        // Clear form
        setMessage("")
        setMediaPreview(null)
        setMediaFile(null)

        // Refresh conversation
        await refreshCurrentChat(selectedContact.id)
        scrollToBottom()
      }
    } catch (err) {
      console.error("Error sending message:", err)
      // Remove optimistic message on error
      setSelectedContact((prev) => ({
        ...prev,
        messages: prev.messages.filter((msg) => msg.id !== optimisticId),
      }))
    }
  }

  const handleProfileClick = (e, userId) => {
    e.stopPropagation()
    navigate(`/profile/${userId}`)
  }

  // Add real-time chat updates
  useEffect(() => {
    if (selectedContact) {
      // Initial fetch
      refreshCurrentChat(selectedContact.id)

      // Set up socket listener for new messages
      socketService.onNewMessage((data) => {
        const { message, senderId } = data
        if (selectedContact.id === senderId) {
          setSelectedContact((prev) => ({
            ...prev,
            messages: [
              ...(prev?.messages || []),
              {
                id: message._id,
                text: message.text,
                media: message.media,
                sent: false,
                time: new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
                isRead: false,
              },
            ],
          }))
        }
      })

      // Shorter polling interval as backup
      const pollInterval = setInterval(() => {
        refreshCurrentChat(selectedContact.id)
      }, 2000) // Poll every 2 seconds for backup

      return () => {
        clearInterval(pollInterval)
        socketService.removeAllListeners()
      }
    }
  }, [selectedContact]) // Use selectedContact directly

  // Update socket connection effect
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      socketService.connect(token)

      socketService.onUserTyping(({ userId }) => {
        setTypingUsers((prev) => new Set(prev).add(userId))
      })

      socketService.onUserStopTyping(({ userId }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
      })

      return () => {
        socketService.disconnect()
      }
    }
  }, [])

  const handleNewMessageClick = () => {
    setIsNewMessage(true)
    setSelectedContact(null)
    fetchAllUsers() // Fetch users when opening new message
  }

  const fetchAllUsers = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setRecipientSuggestions(
        response.data.users.map((user) => ({
          id: user._id,
          name: `${user.firstName} ${user.lastName}`,
          username: user.username,
          profilePicture: user.profilePicture,
          role: user.role,
        })),
      )
    } catch (err) {
      console.error("Error fetching users:", err)
    }
  }

  const handleRecipientSelect = async (recipient) => {
    try {
      // Check if conversation exists
      const existingContact = contacts.find((c) => c.id === recipient.id)
      if (existingContact) {
        setSelectedContact(existingContact)
      } else {
        // Create new contact object
        const newContact = {
          id: recipient.id,
          name: recipient.name,
          username: recipient.username,
          profilePicture: recipient.profilePicture,
          messages: [],
          status: "Hors Ligne",
          isOnline: onlineUsers.has(recipient.id),
        }
        setSelectedContact(newContact)
      }
      setIsNewMessage(false)
      setNewMessageRecipient("") // Clear search input
      setRecipientSuggestions([])

      // Refresh conversations to show new chat
      await refreshConversations()
    } catch (err) {
      console.error("Error selecting recipient:", err)
    }
  }

  const renderNewMessageUI = () => (
    <div className="chat-main">
      <div className="new-message-container">
        <div className="new-message-header">
          <h3>Nouveau Message</h3>
          <button className="close-new-message" onClick={() => setIsNewMessage(false)}>
            ×
          </button>
        </div>

        <div className="recipient-selection">
          <div className="p-4">
            <h4 className="text-lg font-medium mb-4">Choisir un destinataire</h4>

            {/* Search bar for filtering recipients */}
            <div className="recipient-search-container mb-4">
              <input
                type="text"
                className="recipient-search-input"
                placeholder="Rechercher un contact..."
                value={newMessageRecipient}
                onChange={(e) => setNewMessageRecipient(e.target.value)}
              />
              <div className="search-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </div>
            </div>

            <div className="grid gap-2 max-h-[400px] overflow-y-auto">
              {recipientSuggestions
                .filter(
                  (user) =>
                    user.name.toLowerCase().includes(newMessageRecipient.toLowerCase()) ||
                    user.username.toLowerCase().includes(newMessageRecipient.toLowerCase()),
                )
                .map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleRecipientSelect(user)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors recipient-item"
                  >
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture || "/placeholder.svg"}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">@{user.username}</div>
                    </div>
                    {user.role && (
                      <div
                        className={`ml-auto px-2 py-1 rounded-full text-xs font-medium role-badge role-${user.role}`}
                      >
                        {translateRole(user.role)}
                      </div>
                    )}
                  </div>
                ))}

              {recipientSuggestions.filter(
                (user) =>
                  user.name.toLowerCase().includes(newMessageRecipient.toLowerCase()) ||
                  user.username.toLowerCase().includes(newMessageRecipient.toLowerCase()),
              ).length === 0 &&
                newMessageRecipient && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="font-medium">Aucun contact trouvé</div>
                    <div className="text-sm">Essayez un autre terme de recherche</div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    const initializeChat = async () => {
      if (userId) {
        // Find contact in existing contacts
        const existingContact = contacts.find((c) => c.id === userId)

        if (existingContact) {
          await handleContactSelect(existingContact)
        } else {
          // Fetch user info if not in contacts
          try {
            const token = localStorage.getItem("token")
            const response = await axios.get(`http://localhost:5000/api/users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            const user = response.data.user
            const newContact = {
              id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              username: user.username,
              profilePicture: user.profilePicture,
              messages: [],
              status: "Hors Ligne",
            }

            await handleContactSelect(newContact)
          } catch (err) {
            console.error("Error fetching user:", err)
          }
        }
      }
    }

    initializeChat()
  }, [userId, contacts])

  // Add effect to handle URL parameters and state
  useEffect(() => {
    if (userId) {
      // Find contact in existing contacts or fetch new contact info
      const existingContact = contacts.find((c) => c.id === userId)
      if (existingContact) {
        handleContactSelect(existingContact)
      }

      // Set initial message if provided in state
      if (location.state?.initialMessage) {
        setMessage(location.state.initialMessage)
      }
    }
  }, [userId, contacts])

  // Add role translation helper
  const translateRole = (role) => {
    switch (role) {
      case 'student':
        return 'ETUDIANT';
      case 'teacher':
        return 'ENSEIGNANT';
      case 'admin':
        return 'ADMIN';
      default:
        return role;
    }
  };

  return (
    <div className="Appmessagerie">
      <div className="containermessagerie">
        <div className="mainmessagerie">
          <div className="chat-container" style={{ paddingTop: "20px", paddingBottom: "20px" }}>
            <div className="contacts-sidebar">
              <div className="contacts-header">
                <h2>Messages</h2>
                <div className="new-message-container">
                  <button className="new-message-button" onClick={handleNewMessageClick}>
                    +
                  </button>
                </div>
              </div>
              <div className="contacts-search">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="contacts-list">
                {contacts
                  .filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className={`contact-item ${selectedContact?.id === contact.id ? "active" : ""}`}
                      onClick={() => handleContactSelect(contact)}
                    >
                      <div className="contact-avatar">
                        {contact.profilePicture ? (
                          <img
                            src={contact.profilePicture || "/placeholder.svg"}
                            alt={contact.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = "/src/assets/UserCircle.png"
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                            {contact.name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="contact-info">
                        <div className="contact-name">{contact.name}</div>
                        {/* Remove UserStatus component here */}
                        <div className="contact-last-message">{contact.lastMessage}</div>
                      </div>
                      <div className="contact-meta">
                        <div className="contact-time">
                          {contact.latestMessage?.isRead ? "Vu" : contact.latestMessage?.sent ? "Remis" : contact.time}
                        </div>
                        {contact.unread > 0 && <div className="contact-unread">{contact.unread}</div>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {isNewMessage ? (
              renderNewMessageUI()
            ) : (
              <div className="chat-main">
                {selectedContact ? (
                  <>
                    <div className="chat-header">
                      <div
                        className="chat-avatar-container cursor-pointer"
                        onClick={(e) => handleProfileClick(e, selectedContact.id)}
                      >
                        <div className="chat-avatar">
                          {selectedContact.profilePicture ? (
                            <img
                              src={selectedContact.profilePicture || "/placeholder.svg"}
                              alt={selectedContact.name}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null
                                e.target.src = "/src/assets/UserCircle.png"
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                              {selectedContact.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="chat-user-info">
                          <div className="chat-username">{selectedContact.name}</div>
                          <div className="chat-status">@{selectedContact.username}</div> {/* Replace status with username */}
                        </div>
                      </div>
                    </div>
                    <div className="chat-messages">
                      {renderMessages()}
                      {typingUsers.has(selectedContact?.id) && <TypingIndicator isTyping={true} />}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="chat-input-container">
                      <button className="chat-attach-button" onClick={handleAttachment}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="attachment-icon"
                        >
                          <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                        </svg>
                      </button>
                      {mediaPreview && (
                        <div className="media-preview-indicator">
                          📷 Fichier joint
                          <button onClick={() => setMediaPreview(null)}>×</button>
                        </div>
                      )}

                      <input
                        type="text"
                        className="chat-input"
                        placeholder="Écrivez un message..."
                        value={message}
                        onChange={handleMessageInput}
                        onKeyPress={handleKeyPress}
                      />
                      <button className="chat-send-button" onClick={handleSendMessage}>
                        ➤
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-chat">
                    <div className="empty-chat-icon">💬</div>
                    <div className="empty-chat-text">Sélectionnez une conversation</div>
                    <div className="empty-chat-subtext">Choisissez un contact pour commencer à discuter</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Messagerie
