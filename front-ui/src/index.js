import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import keycloakService from "./KeycloakService";

const root = ReactDOM.createRoot(document.getElementById('root'));


keycloakService.init({
    onLoad: 'login-required'
}).then((authenticated) => {
    if(authenticated)
    {
        root.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
      }
    else{
        window.location.reload();
    }
    }
).catch((error) => {
    console.error("Keycloak initialization failed:", error);
    alert("Impossible de se connecter au serveur d'authentification");
})

reportWebVitals();
