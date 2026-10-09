import { useEffect } from "react";
import useSocietyAuthStore from "../store/societyAuthStore";

const AuthInitializer = ({ children }) => {
  const initializeAuth = useSocietyAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    const unsubscribe = initializeAuth();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [initializeAuth]);

  return children;
};

export default AuthInitializer;
