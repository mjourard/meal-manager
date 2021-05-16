import { Component } from "react";
import OrdersDataService from "../../services/orders.service";

export default class EditOrder extends Component {
    constructor(props) {
        console.log("in editOrder");
        super(props);
        this.getOrder = this.getOrder.bind(this);

        this.state = {
            currentOrder: {},
        };
    }

    componentDidMount() {
        this.getOrder(this.props.match.params.id);
    }

    getOrder(id) {
        OrdersDataService.get(id)
            .then(response => {
                console.log(response.data);
                this.setState({
                    currentOrder: response.data
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Order Details</h4>
                    {this.state.currentOrder.id ?
                        <p>loaded!</p>
                    : <p>Loading</p>}
                </div>
            </div>
        );
    }
}
