import React, { useCallback } from 'react';

import {
  ModalBody, Input, Label, Form, FormGroup, Dropdown, DropdownItem, DropdownToggle, DropdownMenu,
} from 'reactstrap';

import { AiAssistantManagementHeader } from './AiAssistantManagementHeader';


type Props = {
  //
}

export const AiAssistantManagementEditShare = (props: Props): JSX.Element => {

  return (
    <>
      <AiAssistantManagementHeader />

      <ModalBody className="px-4">

        <Form>
          {/* トグルスイッチ */}
          <div className="form-check form-switch mb-4">
            <Input
              type="switch"
              role="switch"
              id="shareAssistantSwitch"
              className="form-check-input"
            />
            <Label className="form-check-label" for="shareAssistantSwitch">
              アシスタントを共有する
            </Label>
          </div>

          {/* アクセス権限ドロップダウン */}
          <div className="mb-4">
            <Label className="text-secondary mb-2">ページのアクセス権限</Label>
            <Dropdown className="w-100">
              <DropdownToggle
                caret
                color="light"
                className="w-100 text-start bg-white border d-flex justify-content-between align-items-center"
              >
                <span>UserNameがアクセス可能な全てのページ</span>
              </DropdownToggle>
              <DropdownMenu className="w-100">
                <DropdownItem>
                  UserNameがアクセス可能な全てのページ
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {/* 共有範囲ラジオグループ */}
          <div className="mb-4">
            <Label className="text-secondary mb-3">アシスタントの共有範囲</Label>
            <div className="d-flex flex-column gap-3">
              <FormGroup check>
                <Input
                  type="radio"
                  name="shareScope"
                  id="shareAll"
                  className="form-check-input"
                />
                <Label check for="shareAll" className="d-flex flex-column">
                  <span>全体公開</span>
                  <small className="text-secondary">全てのユーザーに共有されます</small>
                </Label>
              </FormGroup>

              <FormGroup check>
                <Input
                  type="radio"
                  name="shareScope"
                  id="shareGroup"
                  className="form-check-input"
                />
                <Label check for="shareGroup" className="d-flex flex-column">
                  <span>グループを指定</span>
                  <small className="text-secondary">選択したグループのメンバーにのみ共有されます</small>
                </Label>
              </FormGroup>

              <FormGroup check>
                <Input
                  type="radio"
                  name="shareScope"
                  id="shareAccess"
                  className="form-check-input"
                  defaultChecked
                />
                <Label check for="shareAccess" className="d-flex flex-column">
                  <span>ページのアクセス権限と同じ範囲</span>
                  <small className="text-secondary">ページのアクセス権限と同じ範囲で共有されます</small>
                </Label>
              </FormGroup>
            </div>
          </div>
        </Form>

      </ModalBody>
    </>
  );
};
