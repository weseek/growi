import { useState, useMemo, VFC } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from 'reactstrap';
import { useTranslation } from '~/i18n';
import { Revision as IRevision } from '~/interfaces/page';
import RevisionDiff from '~/client/js/components/PageHistory/RevisionDiff';
import { encodeSpaces } from '~/utils/path-utils';

/* eslint-disable react/prop-types */
const DropdownItemContents = ({ title, contents }) => (
  <>
    <div className="h6 mt-1 mb-2"><strong>{title}</strong></div>
    <div className="card well mb-1 p-2">{contents}</div>
  </>
);
/* eslint-enable react/prop-types */


type Props = {
  path?: string,
  revisions: IRevision[],
  sourceRevision?: IRevision,
  targetRevision?: IRevision,
}

export const RevisionComparer:VFC<Props> = (props:Props) => {

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { sourceRevision, targetRevision } = props;
  const { t } = useTranslation();
  const showDiff = (sourceRevision != null && targetRevision != null);

  function toggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  const pagePathUrl = useMemo(() => {
    const { path } = props;
    if (path == null) {
      return;
    }
    const { origin } = window.location;
    const url = new URL(path, origin);

    if (sourceRevision != null && targetRevision != null) {
      const urlParams = `${sourceRevision._id}...${targetRevision._id}`;
      url.searchParams.set('compare', urlParams);
    }

    return encodeSpaces(decodeURI(url.toString()));
  }, [props, sourceRevision, targetRevision]);


  return (
    <div className="revision-compare">
      <div className="d-flex">
        <h4 className="align-self-center">{ t('page_history.comparing_revisions') }</h4>
        <Dropdown
          className="grw-copy-dropdown align-self-center ml-auto"
          isOpen={dropdownOpen}
          toggle={() => toggleDropdown()}
        >
          <DropdownToggle
            caret
            className="d-block text-muted bg-transparent btn-copy border-0 py-0"
          >
            <i className="ti-clipboard"></i>
          </DropdownToggle>
          <DropdownMenu positionFixed right>
            {/* Page path URL */}
            <CopyToClipboard text={pagePathUrl}>
              <DropdownItem className="px-3">
                <DropdownItemContents title={t('copy_to_clipboard.Page URL')} contents={pagePathUrl} />
              </DropdownItem>
            </CopyToClipboard>
            <DropdownItem divider className="my-0"></DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <div className="revision-compare-outer">
        { showDiff && (
          <RevisionDiff
            previousRevision={sourceRevision}
            currentRevision={targetRevision}
          />
        )}
      </div>
    </div>
  );
};
