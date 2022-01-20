
import React, { FC } from 'react';
import { DevidedPagePath } from '@growi/core';


type Props = {
  path: string,
}

const DuplicationAlert:FC<Props> = (props:Props) => {
  const { path } = props;
  const devidedPath = new DevidedPagePath(path);

  return (
    <div className="alert alert-warning py-3">
      <h5 className="font-weight-bold mt-1">ページ名「{devidedPath.latter}」が重複しています</h5>
      <p>
        “{devidedPath.isFormerRoot ? '/' : devidedPath.former}” において “{devidedPath.latter}” というページは複数存在しています。<br />
        詳しくは<a href="#" className="alert-link"> GROWI.4.9における新スキーマについて<i className="icon-share-alt"></i> </a>を参照ください。
      </p>
      <p className="mb-1">以下から遷移するページを選択してください。</p>
    </div>
  );
};

export default DuplicationAlert;
