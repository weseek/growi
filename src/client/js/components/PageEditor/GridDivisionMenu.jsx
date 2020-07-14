import React from 'react';
import PropTypes from 'prop-types';

class GridDivisionMenu extends React.Component {

  render() {
    return (
      <div className="container">
        <div className="row">
          {/* TODO add other grid patterns by GW-3189 */}
          <div className="col-md-4 text-center">
            <h6 className="dropdown-header">2分割</h6>
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="bg-info col-6 border">6</span>
                <span className="bg-info col-6 border">6</span>
              </div>
            </a>
          </div>
          <div className="col-md-4 text-center">
            <h6 className="dropdown-header">3分割</h6>
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="bg-info col-4 border">4</span>
                <span className="bg-info col-4 border">4</span>
                <span className="bg-info col-4 border">4</span>
              </div>
            </a>
          </div>
          <div className="col-md-4 text-center">
            <h6 className="dropdown-header">4分割</h6>
            <a className="dropdown-item" href="#">
              <div className="row">
                <span className="bg-info col-3 border">3</span>
                <span className="bg-info col-3 border">3</span>
                <span className="bg-info col-3 border">3</span>
                <span className="bg-info col-3 border">3</span>
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
