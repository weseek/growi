import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';
import staffCredit from '../StaffCredit/StaffCredit.jsx';
import mirrorMode from '../MirrorMode/MirrorMode.jsx';
import { createPortal } from 'react-dom';

export default class KonamiCommand extends React.Component {

    constructor(props) {
        super(props);
        this.userCommand = [];
        // index of konamiCommand
        this.konamiCommand = {staffCredit: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
                              mirrorMode: ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft'],
            };
        this.konamiCommandList = [['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft']]
        this.state = {
            userCommand: [],
            };  
        this.check = this.check.bind(this);
    }

    check(event) {
        console.log(`'${event.key}' pressed`);
        // compare keydown and next konamiCommand
        // first concat the event.key into userCommand list
        this.setState({
            userCommand: this.state.userCommand.concat(event.key),
        })

        const tempUserCommand = this.state.userCommand
        this.konamiCommandList = this.konamiCommandList.filter( function(value) {
            return value.slice(0,tempUserCommand.length).toString() == tempUserCommand.toString()
        });
        console.log(this.konamiCommandList)

        // if the userCommand has corresponded with one of the Konami Command
        if ((this.konamiCommandList.length == 1)&&(this.konamiCommandList[0].toString()==this.state.userCommand.toString())) {
            let commandExecute = ""
            const keys = Object.keys(this.konamiCommand);
            for (let i = 0;i<keys.length; i++) {
                if (this.konamiCommand[keys[i]].toString() == this.konamiCommandList[0].toString()) {
                    commandExecute = keys[i]
                }
            }
            console.log(commandExecute);
            this.konamiCommandList = []
            return commandExecute;
        }

        if (this.konamiCommandList.length == 0) {
            this.konamiCommandList = [['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ['x', 'x', 'b', 'b', 'a', 'y', 'a', 'y', 'ArrowDown', 'ArrowLeft']]
            this.setState({
                userCommand: [],
            });
        }
        return null;
      }



    render() {
        const keyMap = { check: ['up', 'down', 'right', 'left', 'b', 'a', 'x', 'y'] };
        const handlers = { check: (event) => { return this.check(event) } };
        return (
          <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
          </GlobalHotKeys>
        );
      }
}

KonamiCommand.propTypes = {
};