"use client"

import { useEffect, useState } from "react"
import SignupForm from "./SignupForm"
import WelcomeSection from "./WelcomeSection"

const Signup = () => {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Cleanup function
    return () => setMounted(false)
  }, [])

  return (
    <div className="flex flex-col md:flex-row items-center justify-center w-full min-h-screen bg-dark relative p-6 overflow-hidden">
      {/* Background Waves (static) */}
      <div className="absolute inset-0 -z-10 bg-wave-pattern"></div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-5 overflow-hidden">
        {/* Sparkles */}
        {mounted &&
          Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[#3DDC97] rounded-full sparkle"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 7}s`,
              }}
            ></div>
          ))}
      </div>

      {/* Signup Form with enhanced animation */}
      <div
        className={`bg-white/10 backdrop-blur-lg p-6 md:p-8 pr-10 rounded-lg shadow-lg w-full max-w-lg 
                    transform transition-all duration-1000 ${mounted ? "translate-y-0 opacity-100 scale-100" : "translate-y-12 opacity-0 scale-95"}`}
      >
        <div className="relative z-10">
          <div
            className={`transform transition-all duration-700 delay-300 ${mounted ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <SignupForm />
          </div>
        </div>
      </div>

      {/* Welcome Section with enhanced animation */}
      <div
        className={`relative z-10 transform transition-all duration-1000 delay-500 ${mounted ? "translate-x-0 opacity-100 scale-100" : "translate-x-12 opacity-0 scale-95"}`}
      >
        <WelcomeSection />
      </div>
    </div>
  )
}

export default Signup
