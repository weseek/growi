import React from 'react';
import PropTypes from 'prop-types';
import * as toastr from 'toastr';

import {
  Modal, ModalHeader, ModalBody,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import { createSubscribedElement } from './UnstatedUtils';

import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const OutsideShareLinkModal = (props) => {

  /* const { t } = props; */
  // dummy data
  const dummyDate = new Date().toString();
  const shareLinks = [
    {
      _id: '507f1f77bcf86cd799439011', link: '/507f1f77bcf86cd799439011', expiration: dummyDate, description: 'foobar',
    },
    {
      _id: '52fcebd19a5c4ea066dbfa12', link: '/52fcebd19a5c4ea066dbfa12', expiration: dummyDate, description: 'test',
    },
    {
      _id: '54759eb3c090d83494e2d804', link: '/54759eb3c090d83494e2d804', expiration: dummyDate, description: 'hoge',
    },
    {
      _id: '5349b4ddd2781d08c09890f3', link: '/5349b4ddd2781d08c09890f3', expiration: dummyDate, description: 'fuga',
    },
    {
      _id: '5349b4ddd2781d08c09890f4', link: '/5349b4ddd2781d08c09890f4', expiration: dummyDate, description: 'piyo',
    },
  ];

  function deleteLinkHandler(shareLink) {
    try {
      // call api
      toastr.success(`${shareLink._id} is deleted successfully`);
    }
    catch (err) {
      toastr.error(new Error(`${shareLink._id} is deleted failed`));
    }
  }

  function ShareLinkList() {
    return (
      <>
        {shareLinks.map(shareLink => (
          <tr>
            <td>{shareLink.link}</td>
            <td>{shareLink.expiration}</td>
            <td>{shareLink.description}</td>
            <td>
              <button className="btn btn-outline-warning" type="button" onClick={() => deleteLinkHandler(shareLink)}>
                <i className="icon-trash"></i>Delete
              </button>
            </td>
          </tr>
        ))}
      </>
    );
  }

  return (
    <Modal size="lg" isOpen={props.isOpen} toggle={props.onClose} className="grw-create-page">
      <ModalHeader tag="h4" toggle={props.onClose} className="bg-primary text-light">Title
      </ModalHeader>
      <ModalBody>
        <div className="container">
          <div className="row align-items-center mb-3">
            <h4 className="col-10">Shared Link List</h4>
            <button className="col btn btn-danger" type="button">Delete all links</button>
          </div>

          <div className="">
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Link</th>
                    <th>Expiration</th>
                    <th>Description</th>
                    <th>Order</th>
                  </tr>
                </thead>
                <tbody>
                  <ShareLinkList />
                </tbody>
              </table>
            </div>
            <button className="btn btn-outline-secondary d-block mx-auto px-5 mb-3" type="button">+</button>

            <div className="share-link-form border">
              <h4 className="ml-3">Expiration Date</h4>
              <form>
                <div className="form-group">
                  <div className="custom-control custom-radio offset-4 mb-2">
                    <input id="customRadio1" name="customRadio" type="radio" className="custom-control-input"></input>
                    <label className="custom-control-label" htmlFor="customRadio1">Unlimited</label>
                  </div>

                  <div className="custom-control custom-radio offset-4 mb-2">
                    <input id="customRadio2" name="customRadio" type="radio" className="custom-control-input"></input>
                    <label className="custom-control-label" htmlFor="customRadio2">
                      <div className="row align-items-center m-0">
                        <input className="form-control col-2" type="number" min="1" max="7" value="7"></input>
                        <span className="col-auto">Days</span>
                      </div>
                    </label>
                  </div>

                  <div className="custom-control custom-radio offset-4 mb-2">
                    <input id="customRadio3" name="customRadio" type="radio" className="custom-control-input"></input>
                    <label className="custom-control-label" htmlFor="customRadio3">
                      Custom
                      <div className="date-picker">Date Picker</div>
                    </label>
                  </div>

                  <hr />

                  <div className="form-group row">
                    <label htmlFor="inputDesc" className="col-md-4 col-form-label">Description</label>
                    <div className="col-md-4">
                      <input type="text" className="form-control" id="inputDesc" placeholder="Enter description"></input>
                    </div>
                  </div>

                  <div className="form-group row">
                    <div className="offset-8 col">
                      <button type="button" className="btn btn-primary">Issue</button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

/**
 * Wrapper component for using unstated
 */
const ModalControlWrapper = (props) => {
  return createSubscribedElement(OutsideShareLinkModal, props, [AppContainer, PageContainer]);
};


OutsideShareLinkModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,

  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default withTranslation()(ModalControlWrapper);
