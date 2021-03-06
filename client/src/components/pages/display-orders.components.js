import { Component } from "react";
import OrdersDataService from "../../services/orders.service";
import ToastsService from "../../services/toasts.service";
import Table from "../table.component";
import {Link} from "react-router-dom";
//import OrdersList from "../orders-list.component";

export default class DisplayOrders extends Component {
    constructor(props) {
        super(props);
        this.retrieveOrders = this.retrieveOrders.bind(this);
        this.refreshList = this.refreshList.bind(this);

        this.state = {
            orders: [],
        };
    }

    componentDidMount() {
        this.retrieveOrders();
    }

    retrieveOrders() {
        OrdersDataService.getAll()
            .then(response => {
                let orders = [];
                if (response.data) {
                    response.data.forEach(order => {
                        order["Edit Link"] = <Link to={"/myorders/" + order.id}>Edit</Link>;
                        orders.push(order);
                    })
                }
                this.setState({
                    orders: orders
                });
            })
            .catch(e => {
                ToastsService.webError("Failed to retrieve all Orders", e);
            });
    }

    refreshList() {
        this.retrieveOrders();
    }

    render() {
        const { orders } = this.state;
        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Orders List</h4>
                    {orders.length > 0 ?
                        <Table
                            headers={Object.keys(orders[0])}
                            body={orders}
                        />
                    : <p>Loading</p>}
                </div>
            </div>
        );
    }
}
