import React from 'react';
import PropTypes from 'prop-types';
//import { Pagination }  from 'react-js-pagination';
import Pagination from 'react-bootstrap/lib/Pagination';
export default class RecentCreated extends React.Component {

  render() {
    const testval = null;
    let active = 7;
    let items = [];
    for (let number = 1; number <= 10; number++) {
      items.push(
        <Pagination.Item active={number === active}>{number}</Pagination.Item>
      );
    }
    return (
      <div className="page-list-container-create">
        <ul className="page-list-ul page-list-ul-flat">
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest1
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest2
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest3
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest4
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest5
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest6
            </a>
            <span className="page-list-meta">
            </span>
          </li>

          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox/Bootstrap3" className="page-list-link" data-path="/Sandbox/Bootstrap3" data-short-path="Bootstrap3">/reactTest7
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/" className="page-list-link" data-path="/" data-short-path="">/
            </a>
            <span className="page-list-meta">
              <span className="label label-info">RE</span>
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>

            <a href="/user/tsuyoshi" className="page-list-link" data-path="/user/tsuyoshi" data-short-path="tsuyoshi">/user/tsuyoshi/GC-939
            </a>
            <span className="page-list-meta">
            </span>
          </li>
          <li>
            <img src="/images/icons/user.svg" className="picture img-circle" ></img>
            <a href="/Sandbox" className="page-list-link" data-path="/Sandbox" data-short-path="/Sandbox">/ReactComponentTest
            </a>
            <span className="page-list-meta">
            </span>
          </li>
        </ul>
        <Pagination bsSize="small">{items}</Pagination>
      </div>
    );
  }
}

RecentCreated.propTypes = {
};

RecentCreated.defaultProps = {
  page: {},
  linkTo: '',
  excludePathString: '',
};

