import http from "../http-common";

class OrdersDataService {
    create(data) {
        return http.post("/orders", data);
    }

    getAll() {
        return http.get("/orders");
    }

    get(id) {
        return http.get(`/orders/${id}`);
    }
}

export default new OrdersDataService();