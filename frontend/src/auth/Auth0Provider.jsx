import { Auth0Provider } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";

const Auth0ProviderWithNavigate = ({ children }) => {
  const navigate = useNavigate();

  const domain = "dev-jo6xlkffyi568b1u.us.auth0.com";
  const clientId = "ug1YVU0GOG9azexqKGYk6J3ew1VrKF8G";
  const redirect_uri = window.location.origin;
   const audience = "https://food-ordering-system";
  const onRedirectCallback = (appState) => {
    // Redirects user to the page they intended to visit, or the home page
   navigate(appState?.returnTo || "/auth-callback");
  };

  if (!(domain && clientId && redirectUri)) {
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience,
      }}
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithNavigate;