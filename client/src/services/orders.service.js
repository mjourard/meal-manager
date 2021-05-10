import http from "../http-common";

class OrdersDataService {
    create(data) {
        return http.post("/orders", data);
    }
}

export default new OrdersDataService();