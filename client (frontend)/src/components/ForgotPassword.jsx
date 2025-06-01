"use client"

import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

export default function ForgotPassword() {
  const { language } = useLanguage()
  return (
    <div className="flex items-center justify-center min-h-screen bg-dark text-white select-none">
      <div className="absolute inset-0 -z-10 bg-wave-pattern"></div>
      {/* Blurry Glass Effect Box */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-lg w-96 border border-white/20">
        <h2 className="text-2xl font-semibold text-center text-[#3ddc97] mb-4">{language.forgotPassword.title}</h2>
        <p className="text-sm text-gray-300 text-center mb-6">{language.forgotPassword.emailLabel}</p>

        <form>
          <label className="block text-gray-300 mb-2">{language.forgotPassword.email}</label>
          <input
            type="email"
            required
            className="w-full px-4 py-2 text-white rounded-md outline-none border border-gray-600 focus:ring-2 focus:ring-[#3ddc97]"
            placeholder="exemple@estin.dz"
          />

          <button
            type="submit"
            className="mt-4 w-full bg-[#3ddc97] text-black py-2 rounded-md font-semibold hover:bg-[#2dbd82] transition"
          >
            {language.forgotPassword.resetButton}
          </button>
        </form>

        <div className="mt-4 text-center">
          <Link to="/LogIn" className="text-[#1e1e2e] text-sm hover:underline">
            {language.forgotPassword.loginLink}
          </Link>
        </div>
      </div>
    </div>
  )
}
