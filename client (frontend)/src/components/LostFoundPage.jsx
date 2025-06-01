"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import FloatingButton from "./FloatingButton"
import ItemList from "./ItemList"
import AddItemModal from "./AddItemModal"
import DetailModal from "./DetailModal"
import MyObjectsModal from "./MyObjectsModal"
import historyIcon from "../assets/history.png"
import { motion } from "framer-motion"
import axios from "axios"

// Enhanced LostFoundPage with responsiveness and improved functionality
export default function LostFoundPage() {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [showMyItems, setShowMyItems] = useState(false)

  const [items, setItems] = useState([])
  const [myReportedItems, setMyReportedItems] = useState([])

  const [newItem, setNewItem] = useState({
    type: "",
    title: "",
    description: "",
    image: null,
    location: "",
    time: "",
  })

  const [selectedItem, setSelectedItem] = useState(null)
  const [typeFilter, setTypeFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [timeFilter, setTimeFilter] = useState("")

  // Replace mockItems with backend data
  useEffect(() => {
    const fetchLostFoundItems = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await axios.get("http://localhost:5000/api/lostfound", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const mappedItems = response.data.map((item) => ({
          id: item._id,
          type: item.type === "lost" ? "perdu" : "trouvé",
          title: item.name,
          description: item.description,
          location: item.location,
          time: item.createdAt.split('T')[0],
          status: item.status,
          image: item.image,
          // Store the raw reporter data
          reporter: item.reporter,
          // Keep author mapping for backwards compatibility
          author: item.reporter ? {
            id: item.reporter._id,
            firstName: item.reporter.firstName,
            lastName: item.reporter.lastName,
            username: item.reporter.username,
            avatar: item.reporter.profilePicture,
          } : null
        }));

        setItems(mappedItems)
      } catch (err) {
        console.error("Error fetching lost/found items:", err)
        setItems([])
      }
    }

    fetchLostFoundItems()
  }, [])

  const fetchMyItems = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/lostfound/my-items", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const mappedItems = response.data.map(item => ({
        id: item._id,
        type: item.type === "lost" ? "perdu" : "trouvé",
        title: item.name,
        description: item.description,
        location: item.location,
        time: new Date(item.createdAt).toISOString().split('T')[0],
        status: item.status,
        image: item.image
      }));

      setMyReportedItems(mappedItems);
    } catch (err) {
      console.error("Error fetching my items:", err);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.title || !newItem.description) return

    try {
      const token = localStorage.getItem("token")
      const formData = new FormData()

      formData.append("name", newItem.title)
      formData.append("description", newItem.description)
      formData.append("location", newItem.location)
      formData.append("type", newItem.type === "perdu" ? "lost" : "found")
      
      // Fix image upload - convert base64 to blob if needed
      if (newItem.image) {
        // Handle both File objects and base64 strings
        if (typeof newItem.image === 'string' && newItem.image.startsWith('data:')) {
          // Convert base64 to blob
          const response = await fetch(newItem.image);
          const blob = await response.blob();
          formData.append("image", blob, "image.jpg");
        } else {
          // Direct file upload
          formData.append("image", newItem.image);
        }
      }
      
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      await axios.post(
        "http://localhost:5000/api/lostfound",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          }
        }
      );

      // Immediately fetch updated items list
      const response = await axios.get("http://localhost:5000/api/lostfound", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Map the items with null checks for reporter
      const mappedItems = response.data.map((item) => ({
        id: item._id,
        type: item.type === "lost" ? "perdu" : "trouvé",
        title: item.name,
        description: item.description,
        location: item.location,
        time: item.createdAt.split('T')[0],
        status: item.status,
        image: item.image,
        author: item.reporter ? {
          id: item.reporter._id,
          firstName: item.reporter.firstName,
          lastName: item.reporter.lastName,
          username: item.reporter.username,
          avatar: item.reporter.profilePicture,
        } : {
          id: null,
          firstName: "Utilisateur",
          lastName: "Supprimé",
          username: "deleted",
          avatar: null,
        }
      }));

      setItems(mappedItems);
      setNewItem({ type: "", title: "", description: "", image: null, location: "", time: "" });
      setIsOpen(false);
    } catch (err) {
      console.error("Error adding lost/found item:", err)
    }
  }

  const markAsTraite = (index) => {
    const updatedItems = [...items]
    updatedItems[index].traite = true
    setItems(updatedItems)
  }

  const filteredItems = items.filter((item) => {
    // Filter out retrieved items
    if (item.status === "retrieved") return false;
    
    // Apply other filters
    const matchesType = typeFilter ? item.type === typeFilter : true;
    const matchesLocation = locationFilter ? item.location.toLowerCase().includes(locationFilter.toLowerCase()) : true;
    const matchesTime = timeFilter ? item.time === timeFilter : true;
    return matchesType && matchesLocation && matchesTime;
  });

  const handleContactAuthor = (item) => {
    console.log('DEBUG START -----------');
    console.log('Item:', item);
    console.log('Reporter:', item.reporter);
    console.log('Reporter ID:', item.reporter?._id);

    const reporterId = item.reporter?._id;
    
    if (!reporterId) {
      console.error('No reporter ID found!');
      return;
    }

    console.log('About to navigate to:', `/messagerie/${reporterId}`);
    
    navigate(`/messagerie/${reporterId}`);
    console.log('DEBUG END -----------');
  };

  const handleDetailButtonClick = () => {
    console.log('Selected item for detail:', selectedItem);
    if (selectedItem) {
      setIsDetailOpen(false);
      handleContactAuthor(selectedItem);
    }
  };

  // Add responsive styles
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
    @media (max-width: 768px) {
      .filter-controls {
        flex-direction: column;
        gap: 8px;
      }
      .filter-controls > div {
        width: 100%;
        margin: 0;
      }
    }
  `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <div className="relative p-4 sm:p-6 md:p-8 pt-20 select-none">
      <div className="fixed bottom-6 right-6 z-10">
        <FloatingButton onClick={() => setIsOpen(true)} />
      </div>

      {/* Popup Mes Objets */}
      <AddItemModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={handleAddItem}
      />

      {/* Bouton "Mes objets" avec l'icône et le texte à gauche */}
      <div className="flex justify-start mb-4">
        <motion.button
          onClick={() => setShowMyItems(true)}
          className={`
            flex items-center gap-2 font-semibold text-sm transition
            text-[#3ddc97] hover:text-[#2cb68c]
          `}
          whileHover={{ scale: 1.05, x: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          <img src={historyIcon || "/placeholder.svg"} alt="History" className="w-5 h-5" />
          Mes objets
        </motion.button>
      </div>

      {/* Section Filtres with enhanced animations and responsiveness */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mb-4 filter-controls"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-full sm:w-1/3 sm:mr-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full p-2 rounded-md bg-[#f4f7f9] text-[#1e1e2e] 
                       focus:outline-none focus:ring-2 focus:ring-[#3ddc97] text-sm select
                       transition-all duration-300 hover:shadow-md"
          >
            <option value="">Tout</option>
            <option value="perdu">Perdu</option>
            <option value="trouvé">Trouvé</option>
          </select>
        </motion.div>
        <motion.div
          className="w-full sm:w-1/3 sm:mx-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <input
            type="text"
            placeholder="Lieu"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="w-full p-2 rounded-md bg-[#f4f7f9] text-[#101012]
                       focus:outline-none focus:ring-2 focus:ring-[#3ddc97] text-sm input-style
                       transition-all duration-300 hover:shadow-md"
          />
        </motion.div>
        <motion.div
          className="w-full sm:w-1/3 sm:ml-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <input
            type="date"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full p-2 rounded-md bg-[#f4f7f9] text-[#1e1e2e]
                       focus:outline-none focus:ring-2 focus:ring-[#3ddc97] text-sm input-style
                       transition-all duration-300 hover:shadow-md"
          />
        </motion.div>
      </motion.div>

      {/* Liste des items filtrés with staggered animations */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <ItemList
          items={filteredItems}
          onSelect={(item) => {
            if (!item.traite) {
              setSelectedItem(item)
              setIsDetailOpen(true)
            }
          }}
          onContact={handleContactAuthor}
        />
      </motion.div>

      {/* Modals */}
      <AddItemModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        newItem={newItem}
        setNewItem={setNewItem}
        onAdd={handleAddItem}
      />
      <DetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedItem}
        onContact={handleContactAuthor}
      >
        <button
          className="respond-button"
          onClick={handleDetailButtonClick}
        >
          Répondre
        </button>
      </DetailModal>
      <MyObjectsModal
        isOpen={showMyItems}
        onClose={() => setShowMyItems(false)}
        items={myReportedItems}
        onMarkAsTraite={markAsTraite}
        onOpen={fetchMyItems}
      />
    </div>
  )
}
