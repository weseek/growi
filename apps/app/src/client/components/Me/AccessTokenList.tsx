import React from 'react';

import { useTranslation } from 'react-i18next';


// TODO: add types for accessTokens
type AccessTokenListProps = {
  accessTokens: any[];
  deleteHandler: (tokenId: string) => void;
}
export const AccessTokenList = React.memo((props: AccessTokenListProps): JSX.Element => {

  const { t } = useTranslation();
  const { accessTokens, deleteHandler } = props;

  return (

    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>description</th>
            <th>expiredAt</th>
            <th>scope</th>
            <th>action</th>
          </tr>
        </thead>
        <tbody>
          {(accessTokens.length === 0)
            ? (
              <tr>
                <td colSpan={4} className="text-center">
                  {t('No access tokens found')}
                </td>
              </tr>
            )
            : (
              <>{
                accessTokens.map(token => (
                  <tr key={token._id}>
                    <td>{token.description}</td>
                    {/* <td>{token.expiredAt.toISOString().split('T')[0]}</td> */}
                    <td>{token.expiredAt.toString()}</td>
                    <td>{token.scope.join(', ')}</td>
                    <td>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => deleteHandler(token._id)}
                      >
                        {t('Delete')}
                      </button>
                    </td>
                  </tr>
                ))
              }
              </>
            )}
        </tbody>
      </table>
    </div>
  );
});
