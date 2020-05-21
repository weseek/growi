import React from 'react';
import { GlobalHotKeys } from 'react-hotkeys';

import loggerFactory from '@alias/logger';
import staffCredit from '../StaffCredit/StaffCredit.jsx';
import mirrorMode from '../MirrorMode/MirrorMode.jsx';

export default class KonamiCommand extends React.Component {

    constructor(props) {
        super(props);
        this.userCommand = [];
        // index of KonamiCommand
        this.KonamiCommand = {staffCredit: ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'],
                              mirrorMode: ['x', 'x', 'y', 'y'],
            };
        this.KonamiCommandList = [['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ['x', 'x', 'y', 'y']]
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
        this.KonamiCommandList = this.KonamiCommandList.filter( function(value) {
            return value[0,tempUserCommand.length] == tempUserCommand
        });
        console.log(this.KonamiCommandList)

        // ここからまだ出来ていない
        // if the userCommand has corresponded with one of the Konami Command
        if ((this.KonamiCommandList.length == 1)&&(this.KonamiCommandList[0]==this.state.userCommand)) {
            const keys = Object.keys([this.KonamiCommand]);
            for (let i = 0;i<keys.length; i++) {
                if (this.KonamiCommand[keys[i]] === this.KonamiCommandList[0]) {
                    const commandExecute = keys[i]
                }
            }
            console.log(commandExecute);
        }

        if (this.KonamiCommandList.length == 0) {
            this.KonamiCommandList = [['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'], ['x', 'x', 'y', 'y']]
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