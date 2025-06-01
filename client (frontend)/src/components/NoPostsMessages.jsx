"use client"

import { motion } from "framer-motion"

export default function NoPostsMessage({ isOwnProfile = false }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 text-center">
      <div className="max-w-md mx-auto">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {isOwnProfile ? "Vous n'avez pas encore publié" : "Cet utilisateur n'a pas encore publié"}
        </h3>
        <p className="text-gray-500 mb-6">
          {isOwnProfile
            ? "Vous n'avez pas encore partagé de publications. Commencez à partager vos idées, questions ou découvertes avec la communauté."
            : "Aucune publication n'a été partagée par cet utilisateur pour le moment."}
        </p>

        {isOwnProfile && (
          <motion.button
            className="bg-[#3DDC97] text-white px-5 py-2 rounded-full inline-flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Créer une publication
          </motion.button>
        )}
      </div>
    </div>
  )
}
