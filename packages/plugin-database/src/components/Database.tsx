import React, {
  useMemo, useState,
} from 'react';

import { DatabaseContext } from './database-context';

import styles from './Database.module.scss';

export const Database = (): JSX.Element => {

  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const databaseContext = useMemo(() => {
    return new DatabaseContext();
  }, []);

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
          とろろ
        </div>
      </>
    );
  };

  return <div className={`database ${styles.database}`}>{renderContents()}</div>;
};
