"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { useLanguage } from "../context/LanguageContext"

export default function PasswordInput({ value, onChange }) {
  const [showPassword, setShowPassword] = useState(false)
  const [strength, setStrength] = useState("")
  const { language } = useLanguage()
  // Function to check password strength
  const checkStrength = (password) => {
    if (!password) return "" // No password = No strength

    if (password.length < 6) return "Faible" // Weak if < 6 chars
    if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password)) {
      return "Fort" // Strong: Uppercase, lowercase, number, special char, 8+ chars
    }
    return "Moyen" // Medium if not weak but not strong either
  }

  // Handle password change
  const handlePasswordChange = (e) => {
    onChange(e)
    setStrength(checkStrength(e.target.value))
  }

  return (
    <div className="relative border-b border-gray-400">
      {/* Password Input */}
      <input
        type={showPassword ? "text" : "password"}
        name="password"
        value={value}
        onChange={handlePasswordChange}
        required
        className="peer w-full bg-transparent outline-none py-2 pr-12 text-white placeholder-transparent"
        placeholder={language.signup.password}
      />

      {/* Label */}
      <label
        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
    peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
    peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
    peer-not-placeholder-shown:text-[#3ddc97]"
      >
        {language.signup.password}
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
      <Lock size={18} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />

      {/* Password Strength Indicator (Compact) */}
      {value && (
        <p
          className={`text-xs leading-none absolute bottom-[-14px] left-0 ${
            strength === "Faible" ? "text-red-500" : strength === "Moyen" ? "text-yellow-400" : "text-green-400"
          }`}
        >
          {strength === "Faible" && " Faible"}
          {strength === "Moyen" && " Moyen"}
          {strength === "Fort" && " Fort"}
        </p>
      )}
    </div>
  )
}
