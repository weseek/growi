import Link from 'next/link';
import PropTypes from 'prop-types';

import urljoin from 'url-join';

import LinkedPagePath from '../models/linked-page-path';


const PagePathHierarchicalLink = (props) => {
  const { linkedPagePath, basePath, isInTrash } = props;

  // render root element
  if (linkedPagePath.isRoot) {
    if (basePath != null) {
      return null;
    }

    return isInTrash
      ? (
        <Link className="path-segment" href="/trash">
          <a><i className="icon-trash"></i></a>
        </Link>
      )
      : (
        <Link className="path-segment" href="/">
          <a><i className="icon-home"></i><span className="separator">/</span></a>
        </Link>
      );
  }

  const isParentExists = linkedPagePath.parent != null;
  const isParentRoot = linkedPagePath.parent?.isRoot;
  const isSeparatorRequired = isParentExists && !isParentRoot;

  const href = encodeURI(urljoin(basePath || '/', linkedPagePath.href));

  // eslint-disable-next-line react/prop-types
  const RootElm = ({ children }) => {
    return props.isInnerElem
      ? <>{children}</>
      : <span className="grw-page-path-hierarchical-link d-inline-block text-break">{children}</span>;
  };

  return (
    <RootElm>
      { isParentExists && (
        <PagePathHierarchicalLink linkedPagePath={linkedPagePath.parent} basePath={basePath} isInTrash={isInTrash || linkedPagePath.isInTrash} isInnerElem />
      ) }
      { isSeparatorRequired && (
        <span className="separator">/</span>
      ) }

      <Link className="page-segment" href={href}>{linkedPagePath.pathName}</Link>
    </RootElm>
  );
};

PagePathHierarchicalLink.propTypes = {
  linkedPagePath: PropTypes.instanceOf(LinkedPagePath).isRequired,
  basePath: PropTypes.string,
  isInTrash: PropTypes.bool,

  // !!INTERNAL USE ONLY!!
  isInnerElem: PropTypes.bool,
};

export default PagePathHierarchicalLink;
