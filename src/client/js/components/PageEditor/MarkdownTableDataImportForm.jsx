import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/es/Button';
import Collapse from 'react-bootstrap/es/Collapse';
import MarkdownTable from '../../models/MarkdownTable';

export default class MarkdownTableDataImportForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      dataFormat: 'csv',
      data: '',
      parserErrorMessage: null,
    };

    this.importButtonHandler = this.importButtonHandler.bind(this);
  }

  importButtonHandler() {
    try {
      const markdownTable = this.convertFormDataToMarkdownTable();
      this.props.onImport(markdownTable);
      this.setState({ parserErrorMessage: null });
    }
    catch (e) {
      this.setState({ parserErrorMessage: e.message });
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
        <div className="form-group">
          <label htmlFor="data-import-form-type-select">Select Data Format</label>
          <select
            id="data-import-form-type-select"
            className="form-control"
            componentClass="select"
            placeholder="select"
            value={this.state.dataFormat}
            onChange={(e) => { return this.setState({ dataFormat: e.target.value }) }}
          >
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
            <option value="html">HTML</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="data-import-form-type-textarea">Import Data</label>
          <textarea
            id="data-import-form-type-textarea"
            componentClass="textarea"
            placeholder="Paste table data"
            style={{ height: 200 }}
            onChange={(e) => { return this.setState({ data: e.target.value }) }}
          />
        </div>
        <Collapse in={this.state.parserErrorMessage != null}>
          <div className="form-group">
            <label htmlFor="data-import-form-type-textarea-alert">Parse Error</label>
            <textarea
              id="data-import-form-type-textarea-alert"
              componentClass="textarea"
              style={{ height: 100 }}
              value={this.state.parserErrorMessage || ''}
              readOnly
            />
          </div>
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
  onImport: PropTypes.func,
};
