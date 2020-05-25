import React from 'react';
import StaffCredit from '../StaffCredit/StaffCredit';
import MirrorMode from '../MirrorMode/MirrorMode';

export default class HotkeyRender extends React.Component {
  constructor(props){
    super(props);
    this.commandExecute = this.props.commandExecute;
    this.determineCommand = this.determineCommand.bind(this);
  }
  
  determineCommand(){
    console.log(this.commandExecute)
    if(this.commandExecute == "StaffCredit") {
      return <StaffCredit />
    }else if(this.commandExecute =="MirrorMode") {
      return <MirrorMode />
    }else {
      return null
    }
  }


  render() {
    return(
    <React.Fragment>
      {this.determineCommand()}
    </React.Fragment>
    )
  }
} 

HotkeyRender.propTypes = {
};