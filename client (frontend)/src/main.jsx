import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import AppWrapper from "./AppWrapper"
import { LanguageProvider } from "./context/LanguageContext"
import { SearchProvider } from "./context/SearchContext"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <SearchProvider>
          <AppWrapper />
        </SearchProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
