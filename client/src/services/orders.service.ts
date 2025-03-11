import http from "./client";

class OrdersDataService {
    create(data) {
        return http.post("/orders", data);
    }

    getAll() {
        return http.get("/orders");
    }

    get(id: number) {
        return http.get(`/orders/${id}`);
    }
}

export default new OrdersDataService();