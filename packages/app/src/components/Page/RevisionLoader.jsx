import React from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { Waypoint } from 'react-waypoint';

import { apiv3Get } from '~/client/util/apiv3-client';
import { RendererOptions } from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';


/**
 * Load data from server and render RevisionBody component
 */
class RevisionLoader extends React.Component {

  constructor(props) {
    super(props);
    this.logger = loggerFactory('growi:Page:RevisionLoader');

    this.state = {
      markdown: null,
      isLoading: false,
      isLoaded: false,
      errors: null,
    };

    this.loadData = this.loadData.bind(this);
    this.onWaypointChange = this.onWaypointChange.bind(this);
  }

  UNSAFE_componentWillMount() {
    if (!this.props.lazy) {
      this.loadData();
    }
  }

  async loadData() {
    if (!this.state.isLoaded && !this.state.isLoading) {
      this.setState({ isLoading: true });
    }

    const { pageId, revisionId } = this.props;


    // load data with REST API
    try {
      const res = await apiv3Get(`/revisions/${revisionId}`, { pageId });

      this.setState({
        markdown: res.data?.revision?.body,
        errors: null,
      });

      if (this.props.onRevisionLoaded != null) {
        this.props.onRevisionLoaded(res.data.revision);
      }
    }
    catch (errors) {
      this.setState({ errors });
    }
    finally {
      this.setState({ isLoaded: true, isLoading: false });
    }

  }

  onWaypointChange(event) {
    if (event.currentPosition === Waypoint.above || event.currentPosition === Waypoint.inside) {
      this.loadData();
    }
  }

  render() {
    // ----- before load -----
    if (this.props.lazy && !this.state.isLoaded) {
      return (
        <Waypoint onPositionChange={this.onWaypointChange} bottomOffset="-100px">
          <div className="wiki"></div>
        </Waypoint>
      );
    }

    // ----- loading -----
    if (this.state.isLoading) {
      return (
        <div className="wiki">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        </div>
      );
    }

    // ----- after load -----
    const isForbidden = this.state.errors != null && this.state.errors[0].code === 'forbidden-page';
    let markdown = this.state.markdown;
    if (isForbidden) {
      markdown = `<i class="icon-exclamation p-1"></i>${this.props.t('not_allowed_to_see_this_page')}`;
    }
    else if (this.state.errors != null) {
      const errorMessages = this.state.errors.map((error) => {
        return `<i class="icon-exclamation p-1"></i><span class="text-muted"><em>${error.message}</em></span>`;
      });
      markdown = errorMessages.join('\n');
    }

    return (
      <RevisionRenderer
        rendererOptions={this.props.rendererOptions}
        markdown={markdown}
      />
    );
  }

}


RevisionLoader.propTypes = {
  t: PropTypes.func.isRequired,

  rendererOptions: PropTypes.instanceOf(RendererOptions).isRequired,
  pageId: PropTypes.string.isRequired,
  pagePath: PropTypes.string.isRequired,
  revisionId: PropTypes.string.isRequired,
  lazy: PropTypes.bool,
  onRevisionLoaded: PropTypes.func,
  highlightKeywords: PropTypes.arrayOf(PropTypes.string),
};

const RevisionLoaderWrapperFC = (props) => {
  const { t } = useTranslation();
  return <RevisionLoader t={t} {...props} />;
};

export default RevisionLoaderWrapperFC;
