import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from 'react-bootstrap/es/FormGroup';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';

export default class DataImportForm extends React.PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      dataFormat: 'csv',
      data: ''
    };

    this.importButtonHandler = this.importButtonHandler.bind(this);
  }

  importButtonHandler() {
    this.props.onImport(this.state.dataFormat, this.state.data);
  }

  render() {
    return (
      <form action="" className="data-import-form pt-5">
        <FormGroup>
          <ControlLabel>Select Data Format</ControlLabel>
          <FormControl componentClass="select" placeholder="select"
                       value={this.state.dataFormat} onChange={e => this.setState({dataFormat: e.target.value})}>
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="html">HTML</option>
          </FormControl>
        </FormGroup>
        <FormGroup>
          <ControlLabel>Import Data</ControlLabel>
          <FormControl componentClass="textarea" placeholder="Paste table data" style={{ height: 200 }}
                       onChange={e => this.setState({data: e.target.value})}/>
        </FormGroup>
        <div className="d-flex justify-content-end">
          <Button bsStyle="default" onClick={this.props.onCancel}>Cancel</Button>
          <Button bsStyle="primary" onClick={this.importButtonHandler}>Import</Button>
        </div>
      </form>
    );
  }
}

DataImportForm.propTypes = {
  onCancel: PropTypes.func,
  onImport: PropTypes.func
};
