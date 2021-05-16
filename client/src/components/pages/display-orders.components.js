import { Component } from "react";
import OrdersDataService from "../../services/orders.service";
import Table from "../table.component";
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
                this.setState({
                    orders: response.data
                });
                console.log(response.data);
            })
            .catch(e => {
                console.log(e);
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
