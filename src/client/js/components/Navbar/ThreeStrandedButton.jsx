import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Nav, NavItem, NavLink } from 'reactstrap';

const ThreeStrandedButton = (props) => {
  const { t } = props;

  function threeStrandedButtonClickedHandler(viewType) {
    if (props.onThreeStrandedButtonClicked != null) {
      props.onThreeStrandedButtonClicked(viewType);
    }
  }

  return (
    <Nav>
      <div className="btn-group grw-three-stranded-button" role="group " aria-label="three-stranded-button">
        <NavItem>
          <NavLink
            href="#view"
            type="button"
            className="btn btn-outline-primary view-button"
            onClick={() => { threeStrandedButtonClickedHandler('view') }}
          >
            <i className="icon-control-play icon-fw" />
            { t('view') }
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            href="#edit"
            type="button"
            className="btn btn-outline-primary edit-button"
            onClick={() => { threeStrandedButtonClickedHandler('edit') }}
          >
            <i className="icon-note icon-fw" />
            { t('Edit') }
          </NavLink>
        </NavItem>

        <NavItem>
          <NavLink
            href="#hackmd"
            type="button"
            className="btn btn-outline-primary hackmd-button"
            onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
          >
            <i className="icon-note icon-fw" />
            { t('Edit') }
          </NavLink>
        </NavItem>
        {/* <button
        type="button"
        className="btn btn-outline-primary hackmd-button"
        onClick={() => { threeStrandedButtonClickedHandler('hackmd') }}
      >
        <i className="fa fa-fw fa-file-text-o" />
        { t('hackmd.hack_md') }
      </button> */}
      </div>
    </Nav>


  );

};

ThreeStrandedButton.propTypes = {
  t: PropTypes.func.isRequired, //  i18next

  onThreeStrandedButtonClicked: PropTypes.func,
};

export default withTranslation()(ThreeStrandedButton);
