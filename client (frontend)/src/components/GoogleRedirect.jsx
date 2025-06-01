import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const GoogleRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      navigate("/acceuil");
    }else{
        navigate('/login')
    }
  }, [location, navigate]);

  return (
    <div className="h-screen w-screen flex items-center justify-center animate-pulse">
      <img src='' alt="logo" style={{ width: "200px", height: "200px" }} />
    </div>
  );
};

export default GoogleRedirect;
