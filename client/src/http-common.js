import axios from "axios";

export default axios.create({
    //TODO: update baseURL to be set during the build phase
    baseURL: process.env.REACT_APP_MEALMANAGER_BASE_URL + "/api",
    headers: {
        "Content-type": "application/json"
    }
})