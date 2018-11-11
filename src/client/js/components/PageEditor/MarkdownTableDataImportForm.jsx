import React from 'react';
import PropTypes from 'prop-types';
import FormGroup from 'react-bootstrap/es/FormGroup';
import ControlLabel from 'react-bootstrap/es/ControlLabel';
import FormControl from 'react-bootstrap/es/FormControl';
import Button from 'react-bootstrap/es/Button';
import MarkdownTable from '../../models/MarkdownTable';
import Collapse from 'react-bootstrap/es/Collapse';

export default class MarkdownTableDataImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataFormat: 'csv',
      data: '',
      parserErrorMessage: null
    };

    this.importButtonHandler = this.importButtonHandler.bind(this);
  }

  importButtonHandler() {
    try {
      const markdownTable = this.convertFormDataToMarkdownTable();
      this.props.onImport(markdownTable);
      this.setState({parserErrorMessage: null});
    }
    catch (e) {
      this.setState({parserErrorMessage: e.message});
    }
  }

  convertFormDataToMarkdownTable() {
    let result;
    switch (this.state.dataFormat) {
      case 'csv':
        result = MarkdownTable.fromDSV(this.state.data, ',');
        break;
      case 'tsv':
        result = MarkdownTable.fromDSV(this.state.data, '\t');
        break;
      case 'html':
        result = MarkdownTable.fromHTMLTableTag(this.state.data);
        break;
    }
    return result.normalizeCells();
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
        <Collapse in={this.state.parserErrorMessage != null}>
          <FormGroup>
            <ControlLabel>Parse Error</ControlLabel>
            <FormControl componentClass="textarea" style={{ height: 100 }}  value={this.state.parserErrorMessage} readOnly/>
          </FormGroup>
        </Collapse>
        <div className="d-flex justify-content-end">
          <Button bsStyle="default" onClick={this.props.onCancel}>Cancel</Button>
          <Button bsStyle="primary" onClick={this.importButtonHandler}>Import</Button>
        </div>
      </form>
    );
  }
}

MarkdownTableDataImportForm.propTypes = {
  onCancel: PropTypes.func,
  onImport: PropTypes.func
};
