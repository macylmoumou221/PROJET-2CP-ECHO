"use client"

import { useState, useEffect, useRef } from "react"
import "./Notification.css"
import { Megaphone } from "lucide-react"
import axios from "axios"

const Notification = () => {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  // State declarations
  const [currentUser, setCurrentUser] = useState(null)
  const [currentUserRole, setCurrentUserRole] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [activeTab, setActiveTab] = useState("tous")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)

  // Form states
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [selectedPromotions, setSelectedPromotions] = useState([])
  const [selectedGroups, setSelectedGroups] = useState([])
  const formRef = useRef(null)

  // Constants
  const ITEMS_PER_PAGE = 10
  const promotions = ["2019", "2020", "2021", "2022", "2023", "2024", "2025"]
  const groupMapping = {
    "2019": Array.from({ length: 5 }, (_, i) => `G${i + 1}`),
    2020: Array.from({ length: 6 }, (_, i) => `G${i + 1}`),
    2021: Array.from({ length: 7 }, (_, i) => `G${i + 1}`),
    2022: Array.from({ length: 8 }, (_, i) => `G${i + 1}`),
    2023: Array.from({ length: 9 }, (_, i) => `G${i + 1}`),
    2024: Array.from({ length: 10 }, (_, i) => `G${i + 1}`),
    2025: Array.from({ length: 15 }, (_, i) => `G${i + 1}`),
  }

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        console.log('Current user:', user); // Debug log
        setCurrentUser(user);
        setCurrentUserRole(user.role);
        console.log('User role:', user.role); // Debug log
      } catch (err) {
        console.error('Error parsing user from localStorage:', err);
      }
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchAnnouncements();
  }, [activeTab]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://localhost:5000/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedNotifications = response.data.map(notification => ({
        id: notification._id,
        type: notification.type,
        content: notification.content,
        sender: {
          id: notification.sender._id,
          username: notification.sender.username,
          name: `${notification.sender.firstName} ${notification.sender.lastName}`,
          avatar: notification.sender.profilePicture
        },
        read: notification.isRead,
        createdAt: notification.createdAt
      }));

      setNotifications(formattedNotifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const filterNotificationsByTab = () => {
    switch (activeTab) {
      case "annonces":
        return announcements;
      case "activites":
        return notifications;
      default: // "tous"
        return [...notifications, ...announcements];
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/announcements", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const formattedAnnouncements = response.data.map(announcement => ({
        id: announcement._id,
        type: "announcement",
        title: announcement.title,
        content: announcement.content,
        sender: {
          id: announcement.teacher._id,
          name: `${announcement.teacher.firstName} ${announcement.teacher.lastName}`,
          username: announcement.teacher.username,
          avatar: announcement.teacher.profilePicture
        },
        createdAt: announcement.createdAt,
        read: false // Announcements don't have read status
      }));

      setAnnouncements(formattedAnnouncements);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const handleSubmitAnnouncement = async (e) => {
    e.preventDefault();

    // Changed validation check to use selectedPromotion instead of selectedPromotions array
    if (!announcementTitle.trim() || !announcementContent.trim() || !selectedPromotion) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/announcements", {
        title: announcementTitle,
        content: announcementContent,
        targetPromotions: [selectedPromotion], // Wrap single promotion in array
        targetGroups: selectedGroup ? [selectedGroup] : [] // Only include if group selected
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and reload announcements
      setAnnouncementTitle("");
      setAnnouncementContent("");
      setSelectedPromotion("");
      setSelectedGroup("");
      setShowAnnouncementForm(false);
      fetchAnnouncements();

      // Show success notification
      const notification = document.createElement("div")
      notification.className =
        "fixed top-4 right-4 bg-[#3DDC97] text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center"
      notification.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      <span>Annonce envoyée avec succès!</span>
    `

      document.body.appendChild(notification)

      // Remove the notification after 3 seconds
      setTimeout(() => {
        notification.classList.add("opacity-0", "transition-opacity", "duration-500")
        setTimeout(() => {
          document.body.removeChild(notification)
        }, 500)
      }, 3000)
    } catch (err) {
      console.error("Error creating announcement:", err);
      alert("Erreur lors de la création de l'annonce");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/notifications/${notificationId}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const countUnread = (type = null) => {
    if (!notifications) return 0;
    
    if (type === "annonces") {
      return announcements.filter(n => !n.read).length;
    } else if (type === "activites") {
      return notifications.filter(n => !n.read).length;
    } else {
      return notifications.filter(n => !n.read).length + announcements.filter(n => !n.read).length;
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset page when changing tabs
  };

  const getNotificationIcon = (type) => {
    if (type === "announcement") {
      return (
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
          className="notification-icon announcement"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      )
    } else {
      return (
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
          className="notification-icon activity"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      )
    }
  };

  // Add missing form-related states
  const [selectedPromotion, setSelectedPromotion] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [availableGroups, setAvailableGroups] = useState([]);

  // Add group handling effect
  useEffect(() => {
    if (selectedPromotion) {
      setAvailableGroups(groupMapping[selectedPromotion] || []);
      setSelectedGroup("");
    } else {
      setAvailableGroups([]);
    }
  }, [selectedPromotion]);

  // Updated isTeacher function with debug logs
  const isTeacher = () => {
    console.log('Current user role:', currentUserRole);
    return currentUserRole === 'teacher';
  };

  // Add debug effect
  useEffect(() => {
    console.log('Is user a teacher?', isTeacher());
  }, []);

  // Add role fetch effect
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userRole = response.data.role;
        console.log('Role from backend:', userRole);
        setCurrentUserRole(userRole);
        
        // Also update the cached user object
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          user.role = userRole;
          localStorage.setItem('user', JSON.stringify(user));
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      }
    };

    fetchUserRole();
  }, []);

  const renderHeader = () => {
    console.log('Rendering header, isTeacher():', isTeacher());
    
    return (
      <div className="notification-header">
        <div className="flex justify-between items-center">
          <h1>Notifications</h1>
          {isTeacher() && (
            <button
              onClick={() => {
                console.log('Add announcement button clicked');
                setShowAnnouncementForm(true);
              }}
              className="bg-[#3DDC97] text-white p-2 rounded-full hover:bg-[#32c285] transition-colors shadow-sm"
              title="Créer une annonce"
            >
              <Megaphone size={20} />
            </button>
          )}
        </div>

        <div className="notification-tabs">
          {isTeacher() ? (
            <button
              className="tab-button active"
              onClick={() => handleTabChange("activites")}
            >
              Activités
              {countUnread("activites") > 0 && (
                <span className="tab-badge">{countUnread("activites")}</span>
              )}
            </button>
          ) : (
            <>
              <button
                className={`tab-button ${activeTab === "tous" ? "active" : ""}`}
                onClick={() => handleTabChange("tous")}
              >
                Tous
                {countUnread() > 0 && <span className="tab-badge">{countUnread()}</span>}
              </button>
              <button
                className={`tab-button ${activeTab === "annonces" ? "active" : ""}`}
                onClick={() => handleTabChange("annonces")}
              >
                Annonces
                {countUnread("annonces") > 0 && <span className="tab-badge">{countUnread("annonces")}</span>}
              </button>
              <button
                className={`tab-button ${activeTab === "activites" ? "active" : ""}`}
                onClick={() => handleTabChange("activites")}
              >
                Activités
                {countUnread("activites") > 0 && <span className="tab-badge">{countUnread("activites")}</span>}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="App">
      <div className="container">
        <div className="notification-wrapper">
          <div className="notification-container">
            {renderHeader()}

            <div className="notification-list-container">
              {error ? (
                <div className="error-container">
                  <p>{error}</p>
                </div>
              ) : loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Chargement des notifications...</p>
                </div>
              ) : (
                <div className="notification-list">
                  {filterNotificationsByTab().length > 0 ? (
                    filterNotificationsByTab().map((item) => (
                      <div
                        key={item.id}
                        className={`notification-item ${item.read ? "" : "unread"}`}
                        onClick={() => item.type !== "announcement" && markAsRead(item.id)}
                      >
                        <div className="notification-icon-container">
                          {getNotificationIcon(item.type)}
                        </div>
                        <div className="notification-content">
                          {item.type === "announcement" ? (
                            <>
                              <div className="notification-title font-bold">{item.title}</div>
                              <div className="notification-message">{item.content}</div>
                            </>
                          ) : (
                            <div className="notification-message">
                              <span className="font-bold">{item.sender.name}</span>
                              {" "}
                              {item.content}
                            </div>
                          )}
                          <div className="notification-meta">
                            <span className="notification-time">
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        {!item.read && <div className="unread-indicator"></div>}
                      </div>
                    ))
                  ) : (
                    <div className="no-notifications">
                      <p>Aucune notification pour le moment</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Announcement Form Modal with Blur Effect */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl" ref={formRef}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Nouvelle annonce</h2>
              <button onClick={() => setShowAnnouncementForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitAnnouncement}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre*</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  placeholder="Titre de l'annonce"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu*</label>
                <textarea
                  value={announcementContent}
                  onChange={(e) => setAnnouncementContent(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 min-h-[100px]"
                  placeholder="Contenu de l'annonce"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Promotion*</label>
                  <select
                    value={selectedPromotion}
                    onChange={(e) => setSelectedPromotion(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  >
                    <option value="">Sélectionner</option>
                    {promotions.map((promo) => (
                      <option key={promo} value={promo}>
                        {promo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Groupe (Optionnel)</label>
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    disabled={!selectedPromotion}
                  >
                    <option value="">Tous les groupes</option>
                    {availableGroups.map((group) => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowAnnouncementForm(false)}
                  className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700"
                >
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 bg-[#3DDC97] text-white rounded-md">
                  Envoyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Notification
