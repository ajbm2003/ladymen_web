import { useCallback, useState } from "react";

const useAuth = () => {
  const [token, setTokenState] = useState(() => sessionStorage.getItem("admin_token"));

  const setToken = useCallback((nextToken) => {
    if (nextToken) {
      sessionStorage.setItem("admin_token", nextToken);
    } else {
      sessionStorage.removeItem("admin_token");
    }
    setTokenState(nextToken || null);
  }, []);

  return { token, setToken };
};

export default useAuth;
