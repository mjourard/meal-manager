import React, {Component} from "react";
import UsersDataService from "../../services/users.service";
import UserDetails from "../user-details.component";

export default class EditUser extends Component {
    constructor(props) {
        super(props);
        this.getUser = this.getUser.bind(this);
        this.onChangeFirstName = this.onChangeFirstName.bind(this);
        this.onChangeLastName = this.onChangeLastName.bind(this);
        this.onChangeEmail = this.onChangeEmail.bind(this);
        this.onChangeDefaultChecked = this.onChangeDefaultChecked.bind(this);
        this.updateUser = this.updateUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);

        this.state = {
            currentUser: {},
        };
    }

    componentDidMount() {
        this.getUser(this.props.match.params.id);
    }

    onChangeFirstName(name) {
        this.setState(prevState => ({
            currentUser: {
                ...prevState.currentUser,
                firstName: name
            }
        }));
    }

    onChangeLastName(name) {
        this.setState(prevState => ({
            currentUser: {
                ...prevState.currentUser,
                lastName: name
            }
        }));
    }

    onChangeEmail(email) {
        this.setState(prevState => ({
            currentUser: {
                ...prevState.currentUser,
                email: email
            }
        }));
    }

    onChangeDefaultChecked(defaultChecked) {
        this.setState(prevState => ({
            currentUser: {
                ...prevState.currentUser,
                defaultChecked: defaultChecked
            }
        }));
    }

    getUser(id) {
        UsersDataService.get(id)
            .then(response => {
                this.setState({
                    currentUser: {
                        ...response.data,
                        id: id
                    }
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    updateUser() {
        UsersDataService.update(
            this.state.currentUser.id,
            this.state.currentUser
        )
            .then(response => {
                this.setState({
                    message: "The user was updated successfully!"
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    deleteUser() {
        UsersDataService.delete(this.state.currentUser.id)
            .then(response => {
                this.props.history.push('/users')
            })
            .catch(e => {
                console.log(e);
            });
    }

    render() {
        const currentUser = this.state.currentUser;
        return (
            <div>
                <div className={"edit-form"}>
                    <h2>User Details</h2>
                    {this.state.currentUser.id ?
                        <UserDetails
                            id={currentUser.id}
                            firstName={currentUser.firstName}
                            lastName={currentUser.lastName}
                            email={currentUser.email}
                            defaultChecked={currentUser.defaultChecked}
                            onChangeFirstName={this.onChangeFirstName}
                            onChangeLastName={this.onChangeLastName}
                            onChangeEmail={this.onChangeEmail}
                            onChangeDefaultChecked={this.onChangeDefaultChecked}
                        />
                        : <p>Loading</p>}
                    <button
                        className="badge bg-danger mr-2"
                        onClick={this.deleteUser}
                    >
                        Delete
                    </button>

                    <button
                        type="submit"
                        className="badge bg-success"
                        onClick={this.updateUser}
                    >
                        Update
                    </button>
                    <p>{this.state.message}</p>
                </div>
            </div>
        );
    }
}
