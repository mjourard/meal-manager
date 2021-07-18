import {Component} from "react";
import Toasts from "./toasts.component";

/**
 * @Singleton
 * If this needs to be used in multiple places on the page, need to expose it to services in a different manner
 */
const removalTimeInMS = 1000 * 120;
export default class ToastContainer extends Component {

    constructor(props) {
        super(props);
        this.addToast = this.addToast.bind(this);
        this.toastCanBeRemoved = this.toastCanBeRemoved.bind(this);
        this.filterToasts = this.filterToasts.bind(this);
        this.state = {
            toasts: []
        }
        window.toastContainer = this;
    }

    componentDidMount() {
        setInterval(() => {
            this.filterToasts();
        }, removalTimeInMS)
    }

    addToast(title, message, iconBg) {
        let tempToasts = this.state.toasts;
        tempToasts.push({
            title: title,
            message: message,
            iconBg: iconBg,
            createTime: Date.now()
        })
        this.setState({
            toasts: tempToasts
        })
    }

    filterToasts() {
        this.setState({
            toasts: this.state.toasts.filter(toastObj => !this.toastCanBeRemoved(toastObj))
        })
    }

    toastCanBeRemoved(toastObj) {
        return Date.now() - toastObj.createTime > removalTimeInMS;
    }

    render() {
        return (
            <div aria-live="polite" aria-atomic="true" className="position-relative">
                <div className="toast-container position-absolute top-0 end-0 p-3">
                    {this.state.toasts.map((toast, index) => (
                        <Toasts
                        key={index}
                        title={toast.title}
                        message={toast.message}
                        iconBg={toast.iconBg}
                        />
                    ))}
                </div>
            </div>
        );
    }
}