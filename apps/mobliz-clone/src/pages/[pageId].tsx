import React, { useState, useEffect } from 'react';

import parse from 'html-react-parser';
import { NextPage, GetServerSideProps } from 'next';
import { useRouter } from 'next/router';

import axios from '~/utils/axios';

type Props = {
  pageId: string
}

const DetailPage: NextPage<Props> = (props: Props) => {
  const router = useRouter();
  const pageId = router.query.pageId ?? props.pageId;
  const [htmlString, setHTMLString] = useState();
  const [error, setError] = useState<string>();

  useEffect(() => {
    axios.get(`http://localhost:3000/_cms/${pageId}.json`)
      .then((response) => {
        setHTMLString(response.data.htmlString);
      })
      .catch((error) => {
        setError(`データの取得に失敗しました。\n${JSON.stringify(error)}`);
      });
  }, [pageId]);

  return (
    <div className="border bg-white p-5">
      {error == null ? (
        <>
          {htmlString == null ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          ) : (
            <>{parse(htmlString)}</>
          )}
        </>
      ) : (
        <p>{error}</p>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async(context) => {
  const pageId = context.query.pageId;

  if (typeof pageId !== 'string') {
    return {
      notFound: true,
    };
  }

  return { props: { pageId } };
};

export default DetailPage;
