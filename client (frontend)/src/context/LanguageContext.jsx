"use client"

import { createContext, useContext, useState, useEffect } from "react"
import en from "../locales/en"
import fr from "../locales/fr"

const languages = {
  en,
  fr,
}

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState("en")

  // ✅ Auto-detect browser language on mount
  useEffect(() => {
    const browserLang = navigator.language || navigator.userLanguage
    const shortLang = browserLang.split("-")[0] // "en-US" → "en"
    if (languages[shortLang]) {
      setCurrentLang(shortLang)
    }
  }, [])

  return (
    <LanguageContext.Provider
      value={{
        language: languages[currentLang],
        setCurrentLang,
        currentLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
