import { useEffect, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import PageContainer from '../services/PageContainer';

const CountLikes = (props) => {
  const { appContainer, pageContainer } = props;
  const { pageId } = pageContainer.state;
  const [totalLikes, setTotalLikes] = useState(null);


  const retriveCountLikes = useCallback(async() => {
    const res = await appContainer.apiv3Get('/page/countLikes', { _id: pageId });
    setTotalLikes(res.data.result);
  }, [appContainer, pageId]);

  useEffect(() => {
    retriveCountLikes();
  }, [retriveCountLikes]);

  return (totalLikes);
};

const CountLikesWrapper = withUnstatedContainers(CountLikes, [AppContainer, PageContainer]);


CountLikes.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer),
  pageContainer: PropTypes.instanceOf(PageContainer),
};

export default CountLikesWrapper;
