import {Component, createRef} from "react";
import {Toast} from "bootstrap";

/**
 * Expects the following props:
 * title string: The title of the toast
 * message string: The message to show in the toast
 * iconBg string: One of the 'bg-' classes that controls the colour of the square in the top-left corner of the toast
 *                  Options: bg-primary, bg-secondary, bg-success, bg-danger, bg-warning, bg-info, bg-light, bg-dark
 *
 */
export default class Toasts extends Component {
    constructor(props) {
        super(props);
        this.updateTimePassed = this.updateTimePassed.bind(this);
        this.state = {
            createTime: Date.now(),
            timePassed: 'Just now'
        }
        this.myRef = createRef();
    }

    updateTimePassed() {
        this.setState({
            timePassed: this.calcTimePassed(this.state.createTime, Date.now())
        });
    }

    calcTimePassed(startTime, curTime) {
        let timePassed = curTime - startTime
        if (timePassed < 0) {
            return 'Just now';
        }
        //convert to seconds
        timePassed /= 1000;
        if (timePassed < 60) {
            //less than a minute passed
            return 'Just now';
        }

        //convert to minutes
        timePassed /= 60;
        if (timePassed < 60) {
            timePassed = parseInt(timePassed.toFixed(0));
            if (timePassed === 1) {
                return '1 minute ago';
            }
            return timePassed + ' minutes ago';
        }

        //convert to hours
        timePassed /= 60;
        if (timePassed < 24) {
            timePassed = parseInt(timePassed.toFixed(0));
            if (timePassed === 1) {
                return '1 hour ago';
            }
            return timePassed + ' hours ago';
        }

        //convert to days
        timePassed /= 24;
        timePassed = parseInt(timePassed.toFixed(0));
        if (timePassed === 1) {
            return '1 day ago';
        }
        return timePassed + ' days ago';
    }

    componentDidMount() {
        let myToast = Toast.getOrCreateInstance(this.myRef.current);
        myToast.show();
    }

    render() {
        const base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGElEQVR42mNkIBEwjmoY1TCqYVQDbTUAAD4EABn7wZirAAAAAElFTkSuQmCC";
        return (
            <div className="toast" role="alert" aria-live="assertive" aria-atomic="true"
                 data-bs-delay="10000"
                 data-bs-autohide="true"
                 ref={this.myRef}
            >
                <div className="toast-header">
                    <img src={"data:image/png;base64," + base64Pixel} className={"rounded me-2 " + this.props.iconBg} alt="..."/>
                    <strong className="me-auto">{this.props.title}</strong>
                    <small>{this.state.timePassed}</small>
                    <button type="button" className="btn btn-close" data-bs-dismiss="toast" aria-label="Close"/>
                </div>
                <div className="toast-body">
                    <p>{this.props.message}</p>
                </div>
            </div>
        );
    }
}