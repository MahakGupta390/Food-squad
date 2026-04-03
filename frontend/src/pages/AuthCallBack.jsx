import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth0();
  const hasCreatedUser = useRef(false);

  useEffect(() => {
    // When Auth0 gives us the 'user' object, we know the login worked!
    if (user?.sub && !hasCreatedUser.current) {
      console.log("User logged in:", user);
      
      // In the next step, we will call your Backend here to save the user.
      // For now, let's just send them back to the home page.
      
      hasCreatedUser.current = true;
      navigate("/");
    }
  }, [user, navigate]);

  return <div className="flex h-screen items-center justify-center">Loading your profile...</div>;
};

export default AuthCallbackPage;