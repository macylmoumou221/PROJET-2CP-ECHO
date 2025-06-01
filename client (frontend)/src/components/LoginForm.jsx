"use client"

import { useState } from "react"
import { FiUser } from "react-icons/fi"
import { FcGoogle } from "react-icons/fc"
import PasswordInput from "./PasswordInput"
import { Link, useNavigate } from "react-router-dom" // Utiliser useNavigate ici
import { useLanguage } from "../context/LanguageContext"
import useApiRequest from "../hooks/useApiRequest"
import GoogleSignInButton from "./GoogleSignInButton"
import axios from 'axios';

const LoginForm = () => {
  const {data, error, loading , refetch , BASE_URL} = useApiRequest()
  const [user , setUser] = useState()
  const handleGoogleLogin = () => {
    // Open the new window for Google login
    const authWindow = window.location.href = 
      `${BASE_URL}/api/auth/google`
  };
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { language } = useLanguage() // Assure-toi que cette ligne est bien présente
  const navigate = useNavigate() // Utilisation de useNavigate

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form data submitted:", formData);

    try {
      // Make the POST request directly using axios
      const response = await axios.post(`${BASE_URL}/api/auth/login`, formData);

      // If the response is successful, update the user state
      if (response && response.data) {
        const result = response.data;
        setUser(result); // Set the user data

        // Log user info for debugging
        console.log("User data received:", result);

        const token = result.token;
        console.log('Token:', token, 'User:', result);

        // Store the token in localStorage
        localStorage.setItem("token", token);
        if (token ){
          navigate('/acceuil')
        }
        // Optionally store user data if returned
        if (result.user) {
          localStorage.setItem("user", JSON.stringify(result.user));
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Erreur de connexion : email ou mot de passe invalide.");
    }
  };

  const checkAuth = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token'); // Get token from localStorage
  
    // Redirect to the appropriate page based on token presence
    if (token) {
      navigate('/acceuil'); // Redirect to /accueil if logged in
    } else {
      navigate('/login'); // Redirect to /login if not logged in
    }
  };
  

  return (
    <form className="space-y-6 select-none" onSubmit={handleSubmit}>
      <h1 className="text-2xl text-[#3ddc97] font-bold text-center">{language.login.title}</h1>

      {/* Username Input */}
      <div className="relative border-b border-gray-400">
        <input
          type="text"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="peer w-full bg-transparent outline-none py-2 pr-8 text-white placeholder-transparent"
          placeholder=""
          required
        />
        <label
          className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-300 transition-all duration-200 
               peer-focus:top-0 peer-focus:text-sm peer-focus:text-[#3ddc97] 
               peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-sm 
               peer-not-placeholder-shown:text-[#3ddc97]"
        >
          {language.login.username}
        </label>
        <FiUser className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300" />
      </div>

      {/* Password Input */}
      <PasswordInput value={formData.password} onChange={handleChange} />

      {/* Buttons */}
      <button
        type="submit"
        className="w-full bg-[#3ddc97] py-2 mt-1 rounded-lg text-white font-bold hover:bg-[#32c587] cursor-pointer"
      >
        {language.login.loginButton}
      </button>
      <div className="flex justify-center">
              <GoogleSignInButton
                onClick={handleGoogleLogin}
                buttonText={language.signup.googleButton}
              />
            </div>
      <p className="text-center text-[#5E5E61]">
        {language.login.signupPrompt}{" "}
        <Link to="/signup" className="text-[#2A2A3B] font-bold hover:underline">
          {language.login.signupLink}
        </Link>
      </p>
    </form>
  )
}

export default LoginForm
