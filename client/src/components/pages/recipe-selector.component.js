import {Component} from "react";
import RecipesDataService from "../../services/recipes.service";
import OrdersDataService from "../../services/orders.service";
import UsersDataService from "../../services/users.service";
import RecipesList from "../recipes-list.component";

export default class RecipeSelector extends Component {
    constructor(props) {
        super(props);
        this.retrieveRecipes = this.retrieveRecipes.bind(this);
        this.retrieveUsers = this.retrieveUsers.bind(this);
        this.refreshList = this.refreshList.bind(this);
        this.addRecipeSelection = this.addRecipeSelection.bind(this);
        this.removeRecipeSelection = this.removeRecipeSelection.bind(this);
        this.addRandomRecipe = this.addRandomRecipe.bind(this);
        this.handleMessageChange = this.handleMessageChange.bind(this);
        this.handleUserChange = this.handleUserChange.bind(this);
        this.onChangeAddAdditionalMessage = this.onChangeAddAdditionalMessage.bind(this);
        this.submit = this.submit.bind(this);

        this.state = {
            recipes: [],
            selectedRecipes: [],
            users: [],
            selectedUserIds: new Set(),
            message: "",
            showMessageBox: false
        };
    }

    handleMessageChange(event) {
        this.setState({message: event.target.value})
    }

    handleUserChange(user, event) {
        if (event.target.checked === true) {
            console.log('adding user: ' + user.id);
            this.state.selectedUserIds.add(user.id)
        } else if (this.state.selectedUserIds.has(user.id)) {
            console.log('deleting user: ' + user.id);
            this.state.selectedUserIds.delete(user.id)
        }
    }

    onChangeAddAdditionalMessage(e) {
        this.setState({
            showMessageBox: !!(e.target.checked)
        })
    }

    submit() {
        let data = {
            selectedRecipes: this.state.selectedRecipes.map(recipe => recipe.id),
            selectedUserIds: Array.from(this.state.selectedUserIds)
        };
        if (this.state.showMessageBox && this.state.message !== "") {
            data['message'] = this.state.message;
        }
        OrdersDataService.create(data)
            .then(response => {
            })
            .catch(e => {
                console.log(e);
            })
    }

    componentDidMount() {
        this.retrieveRecipes();
        this.retrieveUsers();
    }

    retrieveRecipes() {
        RecipesDataService.getAll()
            .then(response => {
                this.setState({
                    recipes: response.data
                });
            })
            .catch(e => {
                console.log(e);
            });
    }

    retrieveUsers() {
        UsersDataService.getAll()
            .then(response => {
                this.setState({
                    users: response.data
                });
                response.data.forEach(user => {
                    if (user.defaultChecked) {
                        this.state.selectedUserIds.add(user.id);
                    }
                })
            })
            .catch(e => {
                console.log(e);
            });
    }

    refreshList() {
        this.retrieveRecipes();
        this.setState({
            currentRecipe: null,
            currentIndex: -1
        });
    }

    addRecipeSelection(recipe) {
        let newRecipes = this.state.selectedRecipes;
        newRecipes.push(recipe);
        this.setState({
            selectedRecipes: newRecipes
        });
    }

    removeRecipeSelection() {
        RecipesDataService.deleteAll()
            .then(response => {
                this.refreshList();
            })
            .catch(e => {
                console.log(e);
            });
    }

    addRandomRecipe() {
        if (this.state.selectedRecipes.length === this.state.recipes.length) {
            return;
        }
        let goodRecipe = null;
        while (goodRecipe === null) {
            let idx = Math.floor(Math.random() * this.state.recipes.length);
            let recipe = this.state.recipes[idx];
            let contains = false;
            this.state.selectedRecipes.forEach(selectedRecipe => {
                if (selectedRecipe.id === recipe.id) {
                    contains = true;
                }
            })
            if (!contains) {
                goodRecipe = recipe;
            }
        }
        this.addRecipeSelection(goodRecipe);
    }

    render() {
        const {recipes, selectedRecipes, users} = this.state;

        return (
            <div className="list row">
                <div className="col-md-12">
                    <h4>Select Recipes</h4>
                    <div className={"btn-group"}>
                        <button type={"button"} className={"btn btn-primary dropdown-toggle"}
                                data-bs-toggle={"dropdown"} aria-expanded="false">
                            Add Recipe
                        </button>
                        <ul className="dropdown-menu">
                            {recipes &&
                            recipes.map((recipe, index) => (
                                <li key={index}>
                                    <button
                                        type={"button"}
                                        className={"dropdown-item"}
                                        onClick={() => {
                                            this.addRecipeSelection(recipe);
                                        }
                                        }
                                    >
                                        {recipe.name}
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button type={"button"} className={"btn btn-warning"} onClick={this.addRandomRecipe}>Add Random Recipe</button>
                    </div>
                    <RecipesList
                        recipes={selectedRecipes}
                    />
                    <form>
                        <h4>Send Meal List to These Users:</h4>
                        <div className={"mb-3"}>
                            {users &&
                            users.map((user, index) => (
                                <div className={"form-check"} key={index}>
                                    <input className={"form-check-input"} type={"checkbox"}
                                           id={"target-user-" + user.id}
                                           value={user.id}
                                           defaultChecked={user.defaultChecked}
                                           onChange={event => this.handleUserChange(user, event)}
                                    />
                                    <label className={"form-check-label"} htmlFor={"target-user-" + user.id}>
                                        {user.firstName} {user.lastName} ({user.email})
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className={"mb-3 form-check"}>
                            <input type={"checkbox"} className={"form-check-input"} id={"add-additional-message-checkbox"}
                                   onChange={this.onChangeAddAdditionalMessage}
                            />
                            <label className={"form-check-label"} htmlFor={"add-additional-message-checkbox"}>I'd like to include a message</label>
                        </div>
                        {this.state.showMessageBox ?
                            <div className="mb-3" id={"hidden-additional-message"}>
                                <label htmlFor="additional-message" className="form-label">Say something nice...</label>
                                <textarea className="form-control" id="additional-message" rows="4"
                                          value={this.state.message} onChange={this.handleMessageChange}/>
                            </div>
                        : ""}
                        <button type={"button"} className={"btn btn-primary"} onClick={this.submit}>
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        );
    }
}