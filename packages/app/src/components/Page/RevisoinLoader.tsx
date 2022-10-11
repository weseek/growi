import React, { useState } from 'react';

import { useTranslation } from 'next-i18next';
import PropTypes from 'prop-types';
import { Waypoint } from 'react-waypoint';

import { apiv3Get } from '~/client/util/apiv3-client';
import { RendererOptions } from '~/services/renderer/renderer';
import loggerFactory from '~/utils/logger';

import RevisionRenderer from './RevisionRenderer';

type Props = {
  pageId: any,
  revisionId: any,
}

/**
 * Load data from server and render RevisionBody component
 */
export const RevisionLoader = (props: Props): JSX.Element => {
  const [isLoading, setIsLoading] = useState();
  const [isLoaded, setIsLoaded] = useState();
  const [markdown, setMarkdown] = useState();
  const [errors, setErrors] = useState();

  async loadData() {
    if (!isLoaded && !isLoading) {
      setIsLoading(true);
    }

    const { pageId, revisionId } = props;


    // load data with REST API
    try {
      const res = await apiv3Get(`/revisions/${revisionId}`, { pageId });

      setMarkdown(res.data?.revision?.body)
      setErrors(null)

      if (this.props.onRevisionLoaded != null) {
        this.props.onRevisionLoaded(res.data.revision);
      }
    }
    catch (errors) {
      setErrors(errors)
    }
    finally {
      setIsLoaded(true)
      setIsLoading(false)
    }

  }

  return (

  )
}
