import React from 'react';

// const UserExtractionTextForm = (props) => {

//   return (
//     <div className="from-group m-r-10">
//       <label className="m-r-5"><i className="fa fa-search"></i></label>
//       <input type="text" />
//     </div>
//   );
// };

class UserExtractionTextForm extends React.Component {

  constructor(props) {
    super();
    this.state = {
      text: '',
    };
  }

  handleChange() {
    this.setState({ text: '' });
  }

  render() {
    return (
      <div className="from-group m-r-10">
        <label className="m-r-5"><i className="fa fa-search"></i></label>
        <input type="text" onChange={this.handleChange} value={this.state.text} />
      </div>
    );
  }

}

export default UserExtractionTextForm;
