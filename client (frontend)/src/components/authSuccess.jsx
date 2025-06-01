import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

const AuthSuccess = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get("token")

    if (token) {
      localStorage.setItem("token", token)
      localStorage.setItem("lastAuth", Date.now().toString()) // Add timestamp
      navigate("/accueil")
    } else {
      console.error("No token received")
      navigate("/login")
    }
  }, [navigate])

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3ddc97] mx-auto mb-4"></div>
        <p className="text-gray-700">Connexion en cours...</p>
      </div>
    </div>
  )
}

export default AuthSuccess
