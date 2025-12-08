import axios from "axios";
import keycloakService from "./KeycloakService";

const API_URL = "http://localhost:8090/courses";
const KEYCLOAK_USERINFO_URL = "http://localhost:8080/realms/elearning-realm/protocol/openid-connect/userinfo";

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
    if (keycloakService.authenticated) {
        try {
            await keycloakService.updateToken(10);
            console.log("Keycloak token (short):", keycloakService.token?.slice?.(0,40));
            config.headers.Authorization = "Bearer " + keycloakService.token;
            console.log("Request to", config.url, "with Authorization header set.");
        } catch (error) {
            console.error("Error setting Authorization header:", error);
            await keycloakService.login();
        }
    } else {
        console.warn("Not authenticated (keycloakService.authenticated=false)");
    }
    return config;
});



const ApiService = {
    getCourses:  () => {
        return api.get("");
    },

    createCourses: (courseData) => {
        return api.post("", courseData);
    },

    getMe: () => {
        return api.get("/me");
    },

    getUserInfo: () => {
        return api.get( "/userinfo");
    },
    getKeycloakUserInfo: () => {

        return axios.get(KEYCLOAK_USERINFO_URL, {
            headers: {
                Authorization: `Bearer ${keycloakService.token}`
            }
        });
    }
}



export default ApiService;