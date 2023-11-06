import React, { useCallback, useState } from 'react';

import { pagePathUtils } from '@growi/core/dist/utils';
import { format } from 'date-fns';
import { useRouter } from 'next/router';

import { createPage } from '~/client/services/page-operation';
import { toastError } from '~/client/util/toastr';
import { useCurrentUser } from '~/stores/context';
import { useSWRxCurrentPage } from '~/stores/page';
import loggerFactory from '~/utils/logger';

import { PageCreateButtonDropdownMenu } from './PageCreateButtonDropdownMenu';

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
            disabled={isCreating}
          />
          <PageCreateButtonDropdownMenu
            onClickCreateNewPageButtonHandler={onClickCreateNewPageButtonHandler}
            onClickCreateTodaysButtonHandler={onClickCreateTodaysButtonHandler}
            onClickTemplateForChildrenButtonHandler={onClickTemplateForChildrenButtonHandler}
            onClickTemplateForDescendantsButtonHandler={onClickTemplateForDescendantsButtonHandler}
          />
        </div>
      )}
    </div>
  );
});
PageCreateButton.displayName = 'PageCreateButton';
