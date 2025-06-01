"use client"

import { createContext, useContext, useState } from "react"
import axios from "axios"

// Set the base URL for Axios
axios.defaults.baseURL = "http://localhost:5000" // Replace with your backend URL

const SearchContext = createContext()

export function SearchProvider({ children }) {
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] })
  const [isSearching, setIsSearching] = useState(false)

  const performSearch = async (query) => {
    if (!query) return
    setIsSearching(true)
    try {
      const token = localStorage.getItem("token") // Correct token key
      const [usersResponse, postsResponse] = await Promise.all([
        axios.get(`/api/users?search=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`/api/posts?search=${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])
      console.log("Users response:", usersResponse.data)
      console.log("Posts response:", postsResponse.data)
      const users = usersResponse.data.users || []
      const posts = postsResponse.data.posts || []
      setSearchResults({ users, posts })
    } catch (error) {
      console.error("Error performing search:", error)
      setSearchResults({ users: [], posts: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const getQuickSearchResults = async (query) => {
    if (!query || query.trim() === "") return []
    try {
      const token = localStorage.getItem("token") // Correct token key
      const response = await axios.get(`/api/users?search=${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.data.users || []
    } catch (error) {
      console.error("Error fetching quick search results:", error)
      return []
    }
  }

  return (
    <SearchContext.Provider
      value={{
        searchResults,
        isSearching,
        performSearch,
        getQuickSearchResults,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
