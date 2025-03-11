import React, { useState, useEffect, useRef } from "react";

import {Toast} from "bootstrap";

export type IconBackgroundClass = "bg-primary" | "bg-secondary" | "bg-success" | "bg-danger" | "bg-warning" | "bg-info" | "bg-light" | "bg-dark";
export type ToastProps = {
    title: string; //The title of the toast
    message: string; //The message to show in the toast
    iconBg: IconBackgroundClass;
}

const Toasts: React.FC<ToastProps> = (props) => {
    const [createTime] = useState(Date.now());
    const [timePassed, setTimePassed] = useState("Just now");
    const myRef = useRef<HTMLDivElement | null>(null);

    const base64Pixel = "iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAQAAABKfvVzAAAAGElEQVR42mNkIBEwjmoY1TCqYVQDbTUAAD4EABn7wZirAAAAAElFTkSuQmCC";

    const updateTimePassed = () => {
        setTimePassed(calcTimePassed(createTime, Date.now()));
    }

    const calcTimePassed = (startTime: number, curTime: number): string => {
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

    useEffect(() => {
        if (myRef.current) {
            const myToast = Toast.getOrCreateInstance(myRef.current);
            myToast.show();
        }
    }, [createTime]);

    return (
        <div className="toast" role="alert" aria-live="assertive" aria-atomic="true"
            data-bs-delay="10000"
            data-bs-autohide="true" 
            ref={myRef}
        >
            <div className="toast-header">
                <img src={"data:image/png;base64," + base64Pixel} className={"rounded me-2 " + props.iconBg} alt="..."/>
                <strong className="me-auto">{props.title}</strong>
                <small>{timePassed}</small>
                <button type="button" className="btn btn-close" data-bs-dismiss="toast" aria-label="Close"/>
            </div>
            <div className="toast-body">
                <p>{props.message}</p>
            </div>
        </div>
    );
}

export default Toasts;