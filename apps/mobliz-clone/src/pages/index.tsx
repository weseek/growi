import React, { useState } from 'react';

import { NextPage } from 'next';

import axios from '~/utils/axios';

const Top: NextPage = () => {
  const [body, setBody] = useState<string>();
  axios.get('http://localhost:3000/_api/v3/page?pageId=6522505d8eddc4a6c69499b0').then(data => {
    setBody(data.data.page.revision.body);
  });

  return (
    <div className="border bg-white p-5">
      <pre>{body}</pre>
    </div>
  );
};

export default Top;
