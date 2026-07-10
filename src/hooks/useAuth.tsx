import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem("access_token");
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      setIsAuthenticated(!!token);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('https://lauratek.in:8000/admin/login', { email, password });
      const { access_token } = response.data;
      if (access_token) {
        localStorage.setItem("access_token", access_token);
        setIsAuthenticated(true);
        navigate('/quizzes'); // Navigate to dashboard on successful login
        return true;
      }
      return false;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    navigate('/'); // Navigate to login page on logout
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
};