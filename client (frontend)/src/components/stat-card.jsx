"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"

export default function StatCard({
  id,
  title,
  icon,
  primaryStat,
  primaryLabel,
  secondaryStat,
  secondaryLabel,
  color,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) {
  const [isAnimating, setIsAnimating] = useState(false)

  // Echo palette-inspired color schemes
  const getColorScheme = () => {
    // Base Echo green palette
    const baseScheme = {
      primary: "from-[#3ddc97] to-[#2bb583]",
      secondary: "from-[#2bb583] to-[#1e8e68]",
      light: "bg-[#e6f9f1]",
      medium: "bg-[#c0f0dd]",
      border: "border-[#3ddc97]/30",
      text: "text-[#1e8e68]",
      glow: "shadow-[0_0_15px_rgba(61,220,151,0.5)]",
      accent: "bg-[#3ddc97]",
    }

    // Variations based on the color prop
    const variations = {
      green: baseScheme,
      teal: {
        ...baseScheme,
        primary: "from-[#3ddc97] to-[#2bb583]",
        secondary: "from-[#2bb583] to-[#1e8e68]",
      },
      emerald: {
        ...baseScheme,
        primary: "from-[#34d399] to-[#10b981]",
        secondary: "from-[#10b981] to-[#059669]",
      },
      cyan: {
        ...baseScheme,
        primary: "from-[#22d3ee] to-[#06b6d4]",
        secondary: "from-[#06b6d4] to-[#0891b2]",
      },
      lime: {
        ...baseScheme,
        primary: "from-[#84cc16] to-[#65a30d]",
        secondary: "from-[#65a30d] to-[#4d7c0f]",
      },
      amber: {
        ...baseScheme,
        primary: "from-[#3ddc97] to-[#2bb583]", // Keep Echo green
        secondary: "from-[#2bb583] to-[#1e8e68]",
      },
    }

    return variations[color] || baseScheme
  }

  const colorScheme = getColorScheme()

  const handleClick = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsAnimating(false)
      onClick && onClick()
    }, 300)
  }

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border ${
        colorScheme.border
      } bg-white transition-all duration-300 ${
        isHovered ? `scale-[1.03] ${colorScheme.glow}` : "shadow-lg"
      } ${isAnimating ? "scale-[0.98]" : ""}`}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[#3ddc97]"></div>
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[#3ddc97]"></div>
      </div>

      {/* Card content */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${colorScheme.primary} text-white shadow-md transition-transform duration-300 group-hover:rotate-[5deg] group-hover:scale-110`}
          >
            {icon}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{primaryLabel}</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-extrabold text-gray-800">{primaryStat}</p>
              <div className={`ml-2 h-1.5 w-1.5 rounded-full ${colorScheme.accent} group-hover:animate-pulse`}></div>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{secondaryLabel}</p>
            <div className="flex items-baseline">
              <p className="text-3xl font-extrabold text-gray-800">{secondaryStat}</p>
              <div className={`ml-2 h-1.5 w-1.5 rounded-full ${colorScheme.accent} group-hover:animate-pulse`}></div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${colorScheme.primary} transition-all duration-700 ease-in-out ${
              isHovered ? "w-full" : "w-2/3"
            }`}
          ></div>
        </div>

        {/* Interactive button */}
        <div
          className={`mt-6 flex items-center justify-between rounded-lg bg-gradient-to-r ${
            colorScheme.light
          } px-4 py-3 transition-all duration-300 ${isHovered ? `${colorScheme.medium} shadow-md` : ""}`}
        >
          <span className={`font-medium ${colorScheme.text}`}>View Details</span>
          <div
            className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${
              colorScheme.primary
            } text-white transition-all duration-300 ${isHovered ? "translate-x-1" : ""}`}
          >
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Animated border effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: `linear-gradient(90deg, #3ddc97 0%, #2bb583 25%, #1e8e68 50%, #2bb583 75%, #3ddc97 100%)`,
          backgroundSize: "200% 100%",
          animation: isHovered ? "shimmer 2s infinite" : "none",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          padding: "1px",
        }}
      ></div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: -100% 0;
          }
        }
      `}</style>
    </div>
  )
}
