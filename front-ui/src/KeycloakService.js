import Keycloak from "keycloak-js";

const keycloakConfig = new Keycloak({
    url: "http://localhost:8080",
    realm : "elearning-realm",
    clientId : "react-client"
});


export default keycloakConfig;