import React, {Component} from "react";

export default class UserDetails extends Component {
    constructor(props) {
        super(props);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeDefaultChecked = this.onChangeDefaultChecked.bind(this);
    }

    onChangeFirstName(e) {
        this.props.onChangeFirstName(e.target.value);
    }
    onChangeLastName(e) {
        this.props.onChangeLastName(e.target.value)
    }
    onChangeEmail(e) {
        this.props.onChangeEmail(e.target.value);
    }
    onChangeDefaultChecked(e) {
        this.props.onChangeDefaultChecked(e.target.checked);
    }

    render() {
        let props = this.props;
        return (
            <div className="edit-form">
                <form>
                    <div className="form-group">
                        <label htmlFor="first-name">First Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="first-name"
                            value={props.firstName || ''}
                            onChange={this.onChangeFirstName}
                        />
                    </div>
                    <div className="form-group">
                    <label htmlFor="last-name">Last Name</label>
                    <input
                        type="text"
                        className="form-control"
                        id="last-name"
                        value={props.lastName || ''}
                        onChange={this.onChangeLastName}
                    />
                </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            className="form-control"
                            id="email"
                            value={props.email || ''}
                            onChange={this.onChangeEmail}
                        />
                    </div>
                    <div className={"form-check"}>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="default-checked"
                            value={props.defaultChecked || false}
                            onChange={this.onChangeDefaultChecked}
                        />
                        <label htmlFor="default-checked" className={"form-check-label"}>Default Checked (if the user is checked by default on the "Choose Recipes" screen)</label>
                    </div>
                </form>
            </div>
        );
    }
};