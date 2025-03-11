import axios from "axios";

export default axios.create({
    baseURL: import.meta.env.VITE_MEALMANAGER_BASE_URL + "/api",
    headers: {
        "Content-type": "application/json"
    }
})