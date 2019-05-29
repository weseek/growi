import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

class UserGroupTable extends React.Component {

  constructor(props) {
    super(props);

    this.xss = window.xss;

    this.onDelete = this.onDelete.bind(this);
  }

  onDelete(e) {
    const { target } = e;
    const groupId = target.getAttribute('data-user-group-id');
    const group = this.props.userGroups.find((group) => {
      return group._id === groupId;
    });

    this.props.onDelete(group);
  }

  render() {
    const { t } = this.props;

    return (
      <Fragment>
        <h2>{t('user_group_management.group_list')}</h2>

        <table className="table table-bordered table-user-list">
          <thead>
            <tr>
              <th>{ t('Name') }</th>
              <th>{ t('User') }</th>
              <th width="100px">{ t('Created') }</th>
              <th width="70px"></th>
            </tr>
          </thead>
          <tbody>
            {this.props.userGroups.map((group) => {
              return (
                <tr key={group._id}>
                  {this.props.isAclEnabled
                    ? (
                      <td><a href={`/admin/user-group-detail/${group._id}`}>{this.xss.process(group.name)}</a></td>
                    )
                    : (
                      <td>{this.xss.process(group.name)}</td>
                    )
                  }
                  <td>
                    <ul className="list-inline">
                      {this.props.userGroupRelations[group._id].map((user) => {
                        return <li key={user._id} className="list-inline-item badge badge-primary">{this.xss.process(user.username)}</li>;
                      })}
                    </ul>
                  </td>
                  <td>{group.createdAt}</td>{/* formatdate */}
                  {this.props.isAclEnabled
                    ? (
                      <td>
                        <div className="btn-group admin-group-menu">
                          <button type="button" className="btn btn-default btn-sm dropdown-toggle" data-toggle="dropdown">
                            <i className="icon-settings"></i> <span className="caret"></span>
                          </button>
                          <ul className="dropdown-menu" role="menu">
                            <li>
                              <a href={`/admin/user-group-detail/${group._id}`}>
                                <i className="icon-fw icon-note"></i> { t('Edit') }
                              </a>
                            </li>

                            <li>
                              <a href="#" onClick={this.onDelete} data-user-group-id={group._id}>
                                <i className="icon-fw icon-fire text-danger"></i> { t('Delete') }
                              </a>
                            </li>

                          </ul>
                        </div>
                      </td>
                    )
                    : (
                      <td></td>
                    )
                  }
                </tr>
              );
            })}
          </tbody>
        </table>
      </Fragment>
    );
  }

}

UserGroupTable.propTypes = {
  t: PropTypes.func.isRequired, // i18next
  crowi: PropTypes.object.isRequired,
  userGroups: PropTypes.arrayOf(PropTypes.object).isRequired,
  userGroupRelations: PropTypes.object.isRequired,
  isAclEnabled: PropTypes.bool,
  onDelete: PropTypes.func.isRequired,
};

export default withTranslation()(UserGroupTable);
