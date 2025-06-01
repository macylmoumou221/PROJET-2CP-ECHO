import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useApiRequest = (options = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const BASE_URL = "http://localhost:5000";


  const refetch = async (url, method = "GET", body = null) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios({
        url: `${BASE_URL}${url}`,
        method,
        data: body,
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          ...options.headers,
        },
        ...options,
      });

      setData(response?.data);
      return response?.data;
    } catch (err) {
      setError(err.response?.data || err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };


  return { data, error, loading, refetch, BASE_URL };
};


export default useApiRequest;
