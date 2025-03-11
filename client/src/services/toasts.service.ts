import { type IconBackgroundClass } from "../components/utilities/toasts.component";

class ToastsService {
    info(title: string, message: string) {
        this._addToast(title, message, 'bg-info');
    }

    success(title: string, message: string) {
        this._addToast(title, message, 'bg-success');
    }

    warn(title: string, message: string) {
        this._addToast(title, message, 'bg-warning');
    }

    danger(title: string, message: string) {
        this._addToast(title, message, 'bg-danger');
    }

    primary(title: string, message: string) {
        this._addToast(title, message, 'bg-primary');
    }

    secondary(title: string, message: string) {
        this._addToast(title, message, 'bg-secondary');
    }

    light(title: string, message: string) {
        this._addToast(title, message, 'bg-light');
    }

    dark(title: string, message: string) {
        this._addToast(title, message, 'bg-dark');
    }

    webError(title: string, error: Error) {
        let message = "An unknown error has occurred. Please contact support.";
        if (!!error.message) {
            // a network error on firefox
            if (error.message === "Network Error") {
                message = "A network error has occurred. Please try submitting the request again or reloading the page. If this error persists, please contact support.";
            } else {
                message = error.message;
            }
        }

        this.danger(title, message);
    }

    _addToast(title: string, message: string, iconBg: IconBackgroundClass) {
        if (this._toastsAvailable()) {
            window.toastContainer.addToast(title, message, iconBg);
        }
    }

    _toastsAvailable() {
        return !!window.toastContainer
    }
}

export default new ToastsService();