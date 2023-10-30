import React, { useCallback, useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import { createPage } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

const logger = loggerFactory('growi:cli:PageCreateButton');

export const PageCreateButton = React.memo((): JSX.Element => {
  const router = useRouter();
  const { data: currentPage, isLoading } = useSWRxCurrentPage();
  const { data: currentUser } = useCurrentUser();

  const [isHovered, setIsHovered] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const onMouseEnterHandler = () => {
    setIsHovered(true);
  };

  const onMouseLeaveHandler = () => {
    setIsHovered(false);
  };

  const onClickCreateNewPageButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const parentPath = currentPage == null
        ? '/'
        : currentPage.path;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
        shouldGeneratePath: true,
      };

      const response = await createPage(parentPath, '', params);

      router.push(`${response.page.id}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  const onClickCreateTodaysButtonHandler = useCallback(async() => {
    if (currentUser == null) {
      return;
    }

    try {
      setIsCreating(true);

      const now = format(new Date(), 'yyyy/MM/dd');
      const userHomepagePath = pagePathUtils.userHomepagePath(currentUser);
      const todaysPath = `${userHomepagePath}/memo/${now}`;

      // TODO: get grant, grantUserGroupId data from parent page
      // https://redmine.weseek.co.jp/issues/133892
      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: 1,
        pageTags: [],
        shouldReturnIfPathExists: true,
      };

      await createPage(todaysPath, '', params);

      router.push(`${todaysPath}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentUser, router]);

  const onClickTemplateForChildrenButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const parentPath = currentPage == null
        ? '/'
        : currentPage.path;

      const path = `${parentPath}/_template`;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
        shouldReturnIfPathExists: true,
      };

      await createPage(path, '', params);

      router.push(`${path}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  const onClickTemplateForDescendantsButtonHandler = useCallback(async() => {
    if (isLoading) return;

    try {
      setIsCreating(true);

      const parentPath = currentPage == null
        ? '/'
        : currentPage.path;

      const path = `${parentPath}/__template`;

      const params = {
        isSlackEnabled: false,
        slackChannels: '',
        grant: currentPage?.grant || 1,
        pageTags: [],
        grantUserGroupId: currentPage?.grantedGroup?._id,
        shouldReturnIfPathExists: true,
      };

      await createPage(path, '', params);

      router.push(`${path}#edit`);
    }
    catch (err) {
      logger.warn(err);
      toastError(err);
    }
    finally {
      setIsCreating(false);
    }
  }, [currentPage, isLoading, router]);

  // TODO: update button design
  // https://redmine.weseek.co.jp/issues/132683
  // TODO: i18n
  // https://redmine.weseek.co.jp/issues/132681
  return (
    <div
      className="d-flex flex-row"
      onMouseEnter={onMouseEnterHandler}
      onMouseLeave={onMouseLeaveHandler}
    >
      <div className="btn-group">
        <button
          className="d-block btn btn-primary"
          onClick={onClickCreateNewPageButtonHandler}
          type="button"
          data-testid="grw-sidebar-nav-page-create-button"
          disabled={isCreating}
        >
          <i className="material-symbols-outlined">edit</i>
        </button>
      </div>
      {isHovered && (
        <div className="btn-group dropend">
          <button
            className="btn btn-secondary dropdown-toggle dropdown-toggle-split position-absolute"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          />
          <ul className="dropdown-menu">
            <li>
              <button
                className="dropdown-item"
                onClick={onClickCreateNewPageButtonHandler}
                type="button"
                disabled={isCreating}
              >
                Create New Page
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li><span className="text-muted px-3">Create today&apos;s ...</span></li>
            {/* TODO: show correct create today's page path */}
            {/* https://redmine.weseek.co.jp/issues/133893 */}
            <li>
              <button
                className="dropdown-item"
                onClick={onClickCreateTodaysButtonHandler}
                type="button"
              >
                Create today&apos;s
              </button>
            </li>
            <li><hr className="dropdown-divider" /></li>
            <li><span className="text-muted px-3">Child page template</span></li>
            <li>
              <button
                className="dropdown-item"
                onClick={onClickTemplateForChildrenButtonHandler}
                type="button"
              >
                Template for children
              </button>
            </li>
            <li>
              <button
                className="dropdown-item"
                onClick={onClickTemplateForDescendantsButtonHandler}
                type="button"
              >
                Template for descendants
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
});
PageCreateButton.displayName = 'PageCreateButton';
