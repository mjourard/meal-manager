import {Component} from "react";
import RecipesDataService from "../../services/recipes.service";
import RecipeForm from "../recipe-form.component";
import RecipeReadonly from "../recipe-readonly.component";
import CsvUpload from "../csv-upload.component";

const exampleMultiRecipeFile = new Blob([[
    ['Recipe', 'Description', 'URL'].join(','),
    ['Chicken Parm Stuffed Shells', 'A description of the shells stuffed with chicken parmesan', 'https://www.delish.com/cooking/recipe-ideas/recipes/a58002/chicken-parm-stuffed-shells-recipe/'].join(','),
    ['Chicken & Gravy', '', 'https://www.saltandlavender.com/chicken-and-gravy/'].join(','),
    ['Pad Thai', '', ''].join(','),
].join('\n')]);

export default class AddRecipe extends Component {
    constructor(props) {
        super(props);
        this.onChangeName = this.onChangeName.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.onChangeRecipeURL = this.onChangeRecipeURL.bind(this);
        this.onChangeDisabled = this.onChangeDisabled.bind(this);
        this.saveRecipe = this.saveRecipe.bind(this);
        this.newRecipe = this.newRecipe.bind(this);
        this.onUploadChange = this.onUploadChange.bind(this);
        this.onSaveMultiple = this.onSaveMultiple.bind(this);

        let emptyRecipe = this.initEmptyRecipe();
        this.state = {
            ...emptyRecipe,
            recipeFile: null,
            submitted: false,
            lastCreatedRecipe: this.initEmptyRecipe()
        };
    }

    initEmptyRecipe() {
        return {
            name: "",
            description: "",
            recipeURL: "",
            disabled: false
        }
    }

    onChangeName(name) {
        this.setState({
            name: name
        });
    }

    onChangeDescription(desc) {
        this.setState({
            description: desc
        });
    }

    onChangeRecipeURL(url) {
        this.setState({
            recipeURL: url
        })
    }

    onChangeDisabled(disabled) {
        this.setState({
            disabled: disabled
        });
    }

    saveRecipe() {
        let data = {
            name: this.state.name,
            description: this.state.description,
            recipeURL: this.state.recipeURL,
            disabled: this.state.disabled
        };

        RecipesDataService.create(data)
            .then(response => {
                this.setState({
                    lastCreatedRecipe: response.data,
                    submitted: true
                });
                this.newRecipe();
            })
            .catch(e => {
                console.log(e);
            });
    }

    newRecipe() {
        this.setState({
            name: "",
            description: "",
            recipeURL: "",
            disabled: false
        });
    }

    onUploadChange(file) {
        this.setState({
            recipeFile: file
        });
    }
    onSaveMultiple(disableCallback) {
        if (this.state.recipeFile === null ) {
            //TODO: toast - no file selected
            console.log('no file selected')
            return;
        }
        //upload
        RecipesDataService.multiCreate(this.state.recipeFile)
            .then(response => {
                this.setState({
                    lastCreatedRecipe: response.data,
                    submitted: true
                });
                this.newRecipe();
            })
            .catch(e => {
                console.log(e);
            });

        //cleanup
        this.setState({
            recipeFile: null
        });
        disableCallback();
    }

    render() {
        const newRecipe = this.state.lastCreatedRecipe;

        return (
            <div className="submit-form">
                <h4>Add New Recipe</h4>
                {this.state.submitted ? (
                    <div>
                        <h4>You submitted successfully!</h4>
                        <RecipeReadonly
                            id={newRecipe.id}
                            name={newRecipe.name}
                            description={newRecipe.description}
                            recipeURL={newRecipe.recipeURL}
                            disabled={newRecipe.disabled}
                        />
                    </div>
                ) : ""}
                <div>
                    <RecipeForm
                        name={this.state.name}
                        description={this.state.description}
                        recipeURL={this.state.recipeURL}
                        disabled={this.state.disabled}
                        onChangeName={this.onChangeName}
                        onChangeDescription={this.onChangeDescription}
                        onChangeRecipeURL={this.onChangeRecipeURL}
                        onChangeDisabled={this.onChangeDisabled}
                    />

                    <button onClick={this.saveRecipe} className="btn btn-success">
                        Submit
                    </button>
                </div>
                <h4 className="mt-5">Add Multiple Recipes</h4>
                <CsvUpload
                    exampleFile={exampleMultiRecipeFile}
                    exampleFileName="recipes.csv"
                    uploadLabel="Choose a csv file of recipes to upload..."
                    uploadButtonText="Upload Recipes file"
                    downloadExampleButtonText="Download an example recipes.csv file"
                    onUploadChange={this.onUploadChange}
                    onSaveMultiple={this.onSaveMultiple}
                />
            </div>
        );
    }
}
