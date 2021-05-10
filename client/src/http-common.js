import axios from "axios";

export default axios.create({
    //TODO: update baseURL to be set during the build phase
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-type": "application/json"
    }
})