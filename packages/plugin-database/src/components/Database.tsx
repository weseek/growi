import React, {
  useMemo, useState,
} from 'react';

import { DatabaseContext } from './database-context';

import styles from './Database.module.scss';

type Props = {
  path: string,
};

export const Database = (props: Props): JSX.Element => {

  const { path } = props;
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const databaseContext = useMemo(() => {
    return new DatabaseContext(path, {});
  }, [path]);

  const renderContents = () => {
    if (isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {databaseContext.toString()} (-&gt; <small>{errorMessage}</small>)
        </div>
      );
    }

    return (
      <>
        <div>
          {databaseContext.path}
        </div>
      </>
    );
  };

  return <div className={`database ${styles.database}`}>{renderContents()}</div>;
};
