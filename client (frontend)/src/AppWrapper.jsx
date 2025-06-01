import { Routes, Route } from "react-router-dom"
import LogIn from "./components/LogIn"
import App from "./App"

const AppWrapper = () => (
  <Routes>
    <Route path="/login" element={<LogIn />} />

    <Route path="/*" element={<App />} />
  </Routes>
)

export default AppWrapper
