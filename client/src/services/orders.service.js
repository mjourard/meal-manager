import http from "../http-common";

class OrdersDataService {
    create(data) {
        return http.post("/orders", data);
    }

    getAll() {
        return http.get("/orders");
    }
}

export default new OrdersDataService();