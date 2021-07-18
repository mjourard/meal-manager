import { Component } from "react";
import OrdersDataService from "../../services/orders.service";
import ToastsService from "../../services/toasts.service";
import OrderDetails from "../order-details.component";

export default class EditOrder extends Component {
    constructor(props) {
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
                this.setState({
                    currentOrder: {
                        ...response.data,
                        id: id
                    }
                });
            })
            .catch(e => {
                ToastsService.webError("Failed to fetch Order", e);
            });
    }

    render() {
        const currentOrder = this.state.currentOrder;
        return (
            <div className="list row">
                <div className="col-md-12">
                    <h2>Order Details</h2>
                    {this.state.currentOrder.id ?
                        <OrderDetails
                            id={currentOrder.id}
                            message={currentOrder.message}
                            selectedRecipes={currentOrder.selectedRecipes}
                            selectedUsers={currentOrder.selectedUsers}
                        />
                    : <p>Loading</p>}
                </div>
            </div>
        );
    }
}
