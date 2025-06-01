"use client"

import { useLanguage } from "../context/LanguageContext"

const WelcomeSection = () => {
  const { language } = useLanguage()

  return (
    <div className="hidden md:flex flex-col items-center justify-center text-center text-white p-10 select-none">
      <img src="./logo-vert.png" alt="Logo" className="w-40 -mt-26 mb-2 ml-20 select-none" />

      <h1 className="text-4xl font-bold text-[#3ddc97] ml-20 mb-4 select-none">{language.welcome.title}</h1>
      <p className="ml-20 mt-7 select-none">{language.welcome.subtitle}</p>
    </div>
  )
}

export default WelcomeSection
