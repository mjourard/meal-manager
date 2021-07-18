import React, { Component } from "react";
import UsersDataService from "../../services/users.service";
import ToastsService from "../../services/toasts.service";
import Table from "../table.component";
import {Link} from "react-router-dom";

export default class DisplayUsers extends Component {
    constructor(props) {
        super(props);
        this.retrieveUsers = this.retrieveUsers.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.addUser = this.addUser.bind(this);

        this.state = {
            users: [],
        };
    }

    componentDidMount() {
        this.retrieveUsers();
    }

    retrieveUsers() {
        UsersDataService.getAll()
            .then(response => {
                let users = [];
                response.data.forEach(user => {
                    user["Edit Link"] = <Link to={"/myusers/" + user.id}>Edit</Link>;
                    users.push(user);
                })
                this.setState({
                    users: users
                });
            })
            .catch(e => {
                ToastsService.webError("Failed to fetch Users", e);

            });
    }

    addUser() {
        this.props.history.push('/adduser')
    }

    refreshList() {
        this.retrieveUsers();
    }

    render() {
        const { users } = this.state;
        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Users List</h4>
                    {users.length > 0 ?
                        <Table
                            headers={Object.keys(users[0])}
                            body={users}
                        />
                        : <p>Loading</p>}
                    <button
                        type="button"
                        className="badge bg-success"
                        onClick={this.addUser}
                    >
                        Add User
                    </button>
                </div>
            </div>
        );
    }
}
