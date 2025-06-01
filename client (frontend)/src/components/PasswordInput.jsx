"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

export default function PasswordInput({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false)
  const { language } = useLanguage() // Add this line inside your component

  return (
    <div className="relative border-b border-gray-400 pb-0">
      {/* Password Input */}
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
        required
        placeholder={language.login.password} // ✅ Fix: Added placeholder to match behavior
        className="peer w-full bg-transparent outline-none py-2 pr-12 text-white placeholder-transparent leading-none"
      />

      {/* Label */}
      <label
        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
                   peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
                   peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
                   peer-not-placeholder-shown:text-[#3ddc97]"
      >
        {language.login.password}
      </label>

      {/* Toggle Password Visibility */}
      {value && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300"
        >
          {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
        </button>
      )}

      {/* Lock Icon */}
      <Lock size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />

      {/* Forgot Password Link */}
      <div className="absolute right-0 -bottom-6">
        <Link to="/ForgotPassword" className="text-[#3ddc97] text-xs">
          {language.login.forgotPassword}
        </Link>
      </div>
    </div>
  )
}
