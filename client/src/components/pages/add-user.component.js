import {Component} from "react";
import UsersDataService from "../../services/users.service";
import UserDetails from "../user-details.component";

export default class AddUser extends Component {
    constructor(props) {
        super(props);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeDefaultChecked = this.onChangeDefaultChecked.bind(this);
        this.saveUser = this.saveUser.bind(this);
        this.newUser = this.newUser.bind(this);

        let emptyUser = this.initEmptyUser();
        this.state = {
            ...emptyUser,
            submitted: false,
            lastCreatedUser: this.initEmptyUser()
        };
    }

    initEmptyUser() {
        return {
            firstName: "",
            lastName: "",
            email: "",
            defaultChecked: false
        }
    }

    onChangeLastName(name) {
        this.setState({
            lastName: name
        });
    }
    onChangeFirstName(name) {
        this.setState({
            firstName: name
        });
    }

    onChangeEmail(desc) {
        this.setState({
            email: desc
        });
    }

    onChangeDefaultChecked(url) {
        this.setState({
            defaultChecked: url
        })
    }

    saveUser() {
        let data = {
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            defaultChecked: this.state.defaultChecked,
        };
        UsersDataService.create(data)
            .then(response => {
                this.setState({
                    lastCreatedUser: response.data,
                    submitted: true
                });
                this.newUser();
            })
            .catch(e => {
                console.log(e);
            });
    }

    newUser() {
        this.setState(this.initEmptyUser());
    }

    render() {
        const newUser = this.state.lastCreatedUser;

        return (
            <div className="submit-form">
                <h4>Add New User</h4>
                {this.state.submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                    </div>
                ) : ""}
                <div>
                    <UserDetails
                        firstName={this.state.firstName}
                        lastName={this.state.lastName}
                        email={this.state.email}
                        defaultChecked={this.state.defaultChecked}
                        onChangeFirstName={this.onChangeFirstName}
                        onChangeLastName={this.onChangeLastName}
                        onChangeEmail={this.onChangeEmail}
                        onChangeDefaultChecked={this.onChangeDefaultChecked}
                    />

                    <button onClick={this.saveUser} className="btn btn-success">
                        Submit
                    </button>
                </div>
            </div>
        );
    }
}
