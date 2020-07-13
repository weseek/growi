import React from 'react';
import PropTypes from 'prop-types';

class GridDivisionMenu extends React.Component {

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-4 text-center">
            2分割
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="badge-info col-6 border">6</span>
                <span className="badge-info col-6 border">6</span>
              </div>
            </a>
          </div>
          <div className="col-4 text-center">
            3分割
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="badge-info col-4 border">4</span>
                <span className="badge-info col-4 border">4</span>
                <span className="badge-info col-4 border">4</span>
              </div>
            </a>
          </div>
          <div className="col-4 text-center">
            4分割
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="badge-info col-3 border">3</span>
                <span className="badge-info col-3 border">3</span>
                <span className="badge-info col-3 border">3</span>
                <span className="badge-info col-3 border">3</span>
              </div>
            </a>
          </div>
        </div>
      </div>
    );
  }

}

GridDivisionMenu.propTypes = {
  t: PropTypes.func.isRequired,
};

export default GridDivisionMenu;
