import React from 'react';
import PageEditor from '../PageEditor';
import Page from '../Page';
import PageEditorByHackmd from '../PageEditorByHackmd';


function ViewEditHackmd() {

  return (
    <div>
      <Page />
      <PageEditor />
      <PageEditorByHackmd />
    </div>
  );
}

export default ViewEditHackmd;
