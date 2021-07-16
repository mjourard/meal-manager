import React, {Component} from "react";

/**
 * @props
 * exampleFile Blob: The example file that a user would download to see how to create a file for uploading
 * exampleFileName string: The name given to the example file that is downloaded by the user
 * uploadLabel string: The label placed above the file input indicating to the user what they should do
 * uploadButtonText string: The text on the submit button
 * downloadExampleButtonText string: The text on the download example file button
 * onUploadChange function: runs when the uploaded file is changed
 * onSaveMultiple function: runs when the uploadButton is clicked
 */
export default class CsvUpload extends Component {
    constructor(props) {
        super(props);
        this.onUploadChange = this.onUploadChange.bind(this);
        this.onSaveMultiple = this.onSaveMultiple.bind(this);
        this.downloadExampleFile = this.downloadExampleFile.bind(this);
        this.disableSubmit = this.disableSubmit.bind(this);
        this.state = {
            formFile: null,
            inputKey: Math.random().toString(36)
        }
    }

    disableSubmit() {
        this.setState({
            formFile: null,
            inputKey: Math.random().toString(36)
        });
    }

    onUploadChange(e) {
        this.setState({
            formFile: e.target.files[0]
        });
        this.props.onUploadChange(e.target.files[0]);
    }

    onSaveMultiple() {
        this.props.onSaveMultiple(this.disableSubmit);
    }

    downloadExampleFile() {
        const url = window.URL.createObjectURL(this.props.exampleFile);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', this.props.exampleFileName);
        document.body.appendChild(link);
        link.click();
    }

    render() {
        return (
            <div>
                <div className="mb-3">
                    <label htmlFor="formFile" className="form-label">{this.props.uploadLabel}</label>
                    <input onChange={this.onUploadChange} key={this.state.inputKey || ''} className="form-control" type="file" id="formFile" />
                </div>

                <div className="btn-group mb-3">
                    <button onClick={this.onSaveMultiple} type="button" className="btn btn-success me-2" disabled={!this.state.formFile}>{this.props.uploadButtonText}</button>
                    <button onClick={this.downloadExampleFile} type="button" className="btn btn-primary">{this.props.downloadExampleButtonText}</button>
                </div>
            </div>
        )
    }
}