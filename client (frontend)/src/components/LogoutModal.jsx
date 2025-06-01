"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

const LogoutModal = ({ isOpen, onClose, onSubmit }) => {
  const languageContext = useLanguage()
  const language = languageContext?.language || "fr" // Default to French if undefined
  const translations = languageContext?.translations || {
    fr: {
      logout: "Déconnexion",
      logoutConfirmation: "Êtes-vous sûr de vouloir vous déconnecter?",
      cancel: "Annuler",
      confirmLogout: "Confirmer",
    },
    en: {
      logout: "Logout",
      logoutConfirmation: "Are you sure you want to log out?",
      cancel: "Cancel",
      confirmLogout: "Confirm",
    },
  }

  const navigate = useNavigate()

  useEffect(() => {
    // Add/remove modal-open class to body to prevent scrolling
    if (isOpen) {
      document.body.classList.add("modal-open")
    } else {
      document.body.classList.remove("modal-open")
    }

    // Cleanup function
    return () => {
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  const handleLogout = () => {
    // Remove all possible token names to ensure logout works
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    if (onClose) onClose()
    navigate("/login")
  }

  if (!isOpen) return null

  // Get translations for current language or fallback to French
  const currentTranslations = translations[language] || translations.fr

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 modal-backdrop">
      <div className="relative max-w-md w-full mx-auto">
        {/* Decorative elements */}
        <div className="absolute -z-10 w-40 h-40 rounded-full bg-[#3ddc97]/10 blur-xl -top-10 -left-10"></div>
        <div className="absolute -z-10 w-32 h-32 rounded-full bg-[#3ddc97]/15 blur-xl -bottom-5 -right-5"></div>

        <div className="bg-white dark:bg-[#1e1e2e] rounded-xl shadow-2xl overflow-hidden">
          {/* Header with icon */}
          <div className="p-6 text-center relative">
            {/* Logout icon */}
            <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-red-500 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{currentTranslations.logout}</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">{currentTranslations.logoutConfirmation}</p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
              >
                {currentTranslations.cancel}
              </button>
              <button
                onClick={() => (onSubmit ? onSubmit() : handleLogout())}
                className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-700"
              >
                {currentTranslations.confirmLogout}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LogoutModal
