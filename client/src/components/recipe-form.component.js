import React, {Component} from "react";

export default class RecipeForm extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRecipeURL = this.onChangeRecipeURL.bind(this);
        this.onChangeDisabled = this.onChangeDisabled.bind(this);
    }

    onChangeName(e) {
        this.props.onChangeName(e.target.value);
    }
    onChangeDescription(e) {
        this.props.onChangeDescription(e.target.value);
    }
    onChangeRecipeURL(e) {
        this.props.onChangeRecipeURL(e.target.value);
    }

    onChangeDisabled(e) {
        this.props.onChangeDisabled(e.target.checked);
    }

    render() {
        let props = this.props;
        return (
            <div className="edit-form">
                <form>
                    <div className="form-group">
                        <label htmlFor="title">Name</label>
                        <input
                            type="text"
                            className="form-control"
                            id="title"
                            value={props.name || ''}
                            onChange={this.onChangeName}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            id="description"
                            value={props.description || ''}
                            onChange={this.onChangeDescription}
                        />
                    </div>
                    <div className={"form-group"}>
                        <label htmlFor="recipeURL">Recipe URL</label>
                        <input
                            type="text"
                            className="form-control"
                            id="recipeURL"
                            value={props.recipeURL || ''}
                            onChange={this.onChangeRecipeURL}
                        />
                    </div>
                    <div className={"form-check"}>
                        <label htmlFor="disabled" className="form-check-label">Disabled</label>
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="disabled"
                            value={props.disabled || ''}
                            onChange={this.onChangeDisabled}
                        />
                    </div>
                </form>
            </div>
        );
    }
}
