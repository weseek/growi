import React, { useCallback, useMemo } from 'react';


import { useSWRxLsx } from '../stores/lsx';
import { generatePageNodeTree } from '../utils/page-node';

import { LsxListView } from './LsxPageList/LsxListView';
import { LsxContext } from './lsx-context';

import styles from './Lsx.module.scss';

type Props = {
  children: React.ReactNode,
  className?: string,

  prefix: string,
  num?: string,
  depth?: string,
  sort?: string,
  reverse?: string,
  filter?: string,
  except?: string,

  isImmutable?: boolean,
  isSharedPage?: boolean,
};

const LsxSubstance = React.memo(({
  prefix,
  num, depth, sort, reverse, filter, except,
  isImmutable,
}: Props): JSX.Element => {

  const lsxContext = useMemo(() => {
    const options = {
      num, depth, sort, reverse, filter, except,
    };
    return new LsxContext(prefix, options);
  }, [depth, filter, num, prefix, reverse, sort, except]);

  const {
    data, error, isLoading, setSize,
  } = useSWRxLsx(lsxContext.pagePath, lsxContext.options, isImmutable);

  const hasError = error != null;
  const errorMessage = error?.message;

  const Error = useCallback((): JSX.Element => {
    if (!hasError) {
      return <></>;
    }

    return (
      <details>
        <summary className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i> {lsxContext.toString()}
        </summary>
        <small className="ms-3 text-muted">{errorMessage}</small>
      </details>
    );
  }, [errorMessage, hasError, lsxContext]);

  const Loading = useCallback((): JSX.Element => {
    if (hasError) {
      return <></>;
    }
    if (!isLoading) {
      return <></>;
    }

    return (
      <div className={`text-muted ${isLoading ? 'lsx-blink' : ''}`}>
        <small>
          <i className="fa fa-spinner fa-pulse mr-1"></i>
          {lsxContext.toString()}
        </small>
      </div>
    );
  }, [hasError, isLoading, lsxContext]);

  const contents = useMemo(() => {
    if (data == null) {
      return <></>;
    }

    const depthRange = lsxContext.getOptDepth();

    const nodeTree = generatePageNodeTree(prefix, data.flatMap(d => d.pages), depthRange);
    const basisViewersCount = data.at(-1)?.toppageViewersCount;

    return <LsxListView nodeTree={nodeTree} lsxContext={lsxContext} basisViewersCount={basisViewersCount} />;
  }, [data, lsxContext, prefix]);


  const LoadMore = useCallback(() => {
    const lastResult = data?.at(-1);

    if (lastResult == null) {
      return <></>;
    }

    const { cursor, total } = lastResult;
    const leftItemsNum = total - cursor;

    if (leftItemsNum === 0) {
      return <></>;
    }

    return (
      <div className="row justify-content-center lsx-load-more-row">
        <div className="col-12 col-sm-8 d-flex flex-column align-items-center lsx-load-more-container">
          <button
            type="button"
            className="btn btn btn-block btn-outline-secondary btn-load-more"
            onClick={() => setSize(size => size + 1)}
          >
            Load more<br />
            <span className="text-muted small start-items-label">({leftItemsNum} pages left)</span>
          </button>
        </div>
      </div>
    );
  }, [data, setSize]);


  return (
    <div className={`lsx ${styles.lsx}`}>
      <Error />
      <Loading />
      {contents}
      <LoadMore />
    </div>
  );
});
LsxSubstance.displayName = 'LsxSubstance';

const LsxDisabled = React.memo((): JSX.Element => {
  return (
    <div className="text-muted">
      <i className="fa fa-fw fa-info-circle"></i>
      <small>lsx is not available on the share link page</small>
    </div>
  );
});
LsxDisabled.displayName = 'LsxDisabled';

export const Lsx = React.memo((props: Props): JSX.Element => {
  if (props.isSharedPage) {
    return <LsxDisabled />;
  }

  return <LsxSubstance {...props} />;
});
Lsx.displayName = 'Lsx';

export const LsxImmutable = React.memo((props: Omit<Props, 'isImmutable'>): JSX.Element => {
  return <Lsx {...props} isImmutable />;
});
LsxImmutable.displayName = 'LsxImmutable';
