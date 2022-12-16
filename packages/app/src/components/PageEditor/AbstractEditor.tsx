/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';

import { ICodeMirror } from 'react-codemirror2';


export interface AbstractEditorProps extends ICodeMirror {
  value?: string;
  isGfmMode?: boolean;
  onScrollCursorIntoView?: (line: number) => void;
  onSave?: () => Promise<void>;
  onPasteFiles?: (event: Event) => void;
  onCtrlEnter?: (event: Event) => void;
}

interface defaultProps {
  isGfmMode: true,
}

export default class AbstractEditor<T extends AbstractEditorProps> extends React.Component<T, Record<string, unknown>> {

  constructor(props: Readonly<T>) {
    super(props);

    this.forceToFocus = this.forceToFocus.bind(this);
    this.setCaretLine = this.setCaretLine.bind(this);
    this.setScrollTopByLine = this.setScrollTopByLine.bind(this);

    this.getStrFromBol = this.getStrFromBol.bind(this);
    this.getStrToEol = this.getStrToEol.bind(this);
    this.insertText = this.insertText.bind(this);
    this.insertLinebreak = this.insertLinebreak.bind(this);

    this.dispatchSave = this.dispatchSave.bind(this);
  }

  public static defaultProps: defaultProps = {
    isGfmMode: true,
  };

  forceToFocus(): void {}

  /**
   * set new value
   */
  setValue(_newValue: string): void {}

  /**
   * Enable/Disable GFM mode
   * @param {bool} _bool
   */
  setGfmMode(_bool: boolean): void {}

  /**
   * set caret position of codemirror
   * @param {string} number
   */
  setCaretLine(_line: number): void {}

  /**
   * scroll
   * @param {number} _line
   */
  setScrollTopByLine(_line: number): void {}

  /**
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBol(): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * return strings from current position to EOL(end of line)
   */
  getStrToEol(): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * return strings from BOL(beginning of line) to current position
   */
  getStrFromBolToSelectedUpperPos(): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * replace Beggining Of Line to current position with param 'text'
   * @param {string} _text
   */
  replaceBolToCurrentPos(_text: string): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * replace the current line with param 'text'
   * @param {string} _text
   */
  replaceLine(_text: string): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * insert text
   * @param {string} _text
   */
  insertText(_text: string): Error {
    throw new Error('this method should be impelemented in subclass');
  }

  /**
   * insert line break to the current position
   */
  insertLinebreak(): void {
    this.insertText('\n');
  }

  /**
   * dispatch onSave event
   */
  dispatchSave(): void {
    if (this.props.onSave != null) {
      this.props.onSave();
    }
  }

  /**
   * dispatch onPasteFiles event
   * @param {object} event
   */
  dispatchPasteFiles(event: Event): void {
    if (this.props.onPasteFiles != null) {
      this.props.onPasteFiles(event);
    }
  }

  /**
   * returns items(an array of react elements) in navigation bar for editor
   */
  getNavbarItems(): null {
    return null;
  }

}
