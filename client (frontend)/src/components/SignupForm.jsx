"use client"

import { useState } from "react"
import { FiMail, FiUser } from "react-icons/fi"
import { useNavigate } from "react-router-dom" //  pour la redirection
import PasswordInput from "./PasswordInput1"
import { Link } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"
import GoogleSignInButton from "./GoogleSignInButton"
import useApiRequest from "../hooks/useApiRequest"
import axios from "axios"

const SignupForm = () => {
  const { data, error, loading, refetch, BASE_URL } = useApiRequest()
  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/api/auth/google`
  }

  const navigate = useNavigate() //  pour la redirection
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    lastName: "",
    firstName: "",
  })
  const { language } = useLanguage()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, formData);

      // You may receive token and user from the backend
      const { token, user } = res.data;

      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect to accueil
      navigate("/accueil");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert("Échec de l'inscription : " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <form className="space-y-6 select-none" onSubmit={handleSubmit}>
      <h1 className="text-2xl text-[#3ddc97] font-bold text-center select-none">{language.signup.title}</h1>

      {/* Email Input */}
      <div className="relative border-b border-gray-400 ">
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder="Email"
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
                     peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
                     peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
                     peer-not-placeholder-shown:text-[#3ddc97] "
        >
          {language.signup.email}
        </label>
        <FiMail className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Username Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder="Nom d'utilisateur"
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
                     peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
                     peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
                     peer-not-placeholder-shown:text-[#3ddc97] "
        >
          {language.signup.username}
        </label>
        <FiUser className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Prénom Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder="Prénom"
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
                     peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
                     peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
                     peer-not-placeholder-shown:text-[#3ddc97] "
        >
          {language.signup.firstName || "Prénom"}
        </label>
        <FiUser className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Nom Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder="Nom"
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
                     peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
                     peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
                     peer-not-placeholder-shown:text-[#3ddc97] "
        >
          {language.signup.lastName || "Nom"}
        </label>
        <FiUser className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Password Input */}
      <PasswordInput value={formData.password} onChange={handleChange} />
      {/* Buttons */}
      <button
        type="submit"
        className="w-full bg-[#3ddc97] py-2 rounded-lg text-white font-bold hover:bg-[#32c587] cursor-pointer"
      >
        {language.signup.signupButton}
      </button>

      {/* Google Button */}
      <div className="flex justify-center">
        <GoogleSignInButton onClick={handleGoogleLogin} buttonText={language.signup.googleButton} />
      </div>

      <p className="text-center text-[#5E5E61]">
        {language.signup.loginPrompt}?{" "}
        <Link to="/logIn" className="text-[#2A2A3B] font-bold hover:underline">
          {language.signup.loginLink}
        </Link>
      </p>
    </form>
  )
}

export default SignupForm
