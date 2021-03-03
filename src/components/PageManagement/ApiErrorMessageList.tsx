import { FC } from 'react';
import { toArrayIfNot } from '~/utils/array-utils';
import { useTranslation } from '~/i18n';

type ApiErrorMessageProps = {
  errorCode?: string;
  errorMessage?: string;
  targetPath: string;
  onLoadLatestRevision?:()=> void;
}

const ApiErrorMessage:FC<ApiErrorMessageProps> = (props:ApiErrorMessageProps) => {
  const { errorCode, errorMessage, targetPath } = props;
  const { t } = useTranslation();

  function loadLatestRevision() {
    if (props.onLoadLatestRevision != null) {
      props.onLoadLatestRevision();
    }
  }

  function renderMessageByErrorCode() {
    switch (errorCode) {
      case 'already_exists':
        return (
          <>
            <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.already_exists') }</strong>
            <small><a href={targetPath}>{targetPath} <i className="icon-login"></i></a></small>
          </>
        );
      case 'notfound_or_forbidden':
        return (
          <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.notfound_or_forbidden') }</strong>
        );
      case 'user_not_admin':
        return (
          <strong><i className="icon-fw icon-ban"></i>{ t('page_api_error.user_not_admin') }</strong>
        );
      case 'outdated':
        return (
          <>
            <strong><i className="icon-fw icon-bulb"></i> { t('page_api_error.outdated') }</strong>
            <a className="btn-link" onClick={loadLatestRevision}>
              <i className="fa fa-angle-double-right"></i> { t('Load latest') }
            </a>
          </>
        );
      case 'invalid_path':
        return (
          <strong><i className="icon-fw icon-ban"></i> Invalid path</strong>
        );
      default:
        return (
          <strong><i className="icon-fw icon-ban"></i> Unknown error occured</strong>
        );
    }
  }

  if (errorCode != null) {
    return (
      <span className="text-danger">
        {renderMessageByErrorCode()}
      </span>
    );
  }

  if (errorMessage != null) {
    return (
      <span className="text-danger">
        {errorMessage}
      </span>
    );
  }

  // render null if no error has occurred
  return null;

};


type Props ={
  targetPath: string;
  errs?: any[];
  onLoadLatestRevision?:()=> void;
}

export const ApiErrorMessageList: FC<Props> = (props:Props) => {
  const errs = toArrayIfNot(props.errs);

  return (
    <>
      {errs.map(err => (
        <ApiErrorMessage
          key={err.code}
          errorCode={err.code}
          errorMessage={err.message}
          targetPath={props.targetPath}
          onLoadLatestRevision={props.onLoadLatestRevision}
        />
      ))}
    </>
  );

};
