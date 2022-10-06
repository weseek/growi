import React, {
  useCallback,
  useEffect,
  useMemo, useState,
} from 'react';

import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { DatabaseContext } from './database-context';

import styles from './Database.module.scss';

type Props = {
  path: string,

  extract?: string,
};

export const Database = ({
  path,
  extract,
  ...props
}: Props): JSX.Element => {
  const [isLoading, setLoading] = useState(false);
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [database, setDatabase] = useState<string|undefined>();

  const databaseContext = useMemo(() => {
    return new DatabaseContext(
      path,
      {
        extract,
      },
    );
  }, [extract, path]);

  const loadData = useCallback(async() => {
    setLoading(true);

    let newDatabase;
    try {
      const result = await axios.get('/_api/plugins/database', {
        params: {
          path,
          options: databaseContext.options,
        },
      });

      newDatabase = <ReactMarkdown className="wiki" data-testid="wiki" remarkPlugins={[remarkGfm]}>{ result.data }</ReactMarkdown>;
      setDatabase(newDatabase);
      setError(false);
    }
    catch (error) {
      setError(true);
      setErrorMessage(error.message);
    }
    finally {
      setLoading(false);
    }
  }, [databaseContext.options, path]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderContents = () => {
    if (isError) {
      return (
        <div className="text-warning">
          <i className="fa fa-exclamation-triangle fa-fw"></i>
          {databaseContext.toString()} (-&gt; <small>{errorMessage}</small>)
        </div>
      );
    }

    const showDatabase = database != null && (!isLoading);

    return (
      <>
        { isLoading && (
          <div className={`text-muted ${isLoading ? 'database-blink' : ''}`}>
            <small>
              <i className="fa fa-spinner fa-pulse mr-1"></i>
              {databaseContext.toString()}
            </small>
          </div>
        ) }
        { showDatabase && database }
      </>
    );
  };

  return <div className={`database ${styles.database}`}>{renderContents()}</div>;
};
