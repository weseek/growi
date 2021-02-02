import React, { FC, useState/* , useEffect */ } from 'react';

import { AsyncTypeahead } from 'react-bootstrap-typeahead';
import { apiGet } from '~/client/js/util/apiv1-client';

import { Tag } from '~/interfaces/page';

type Props = {
  tags: Tag[],
  onTagsUpdated: <T extends Tag[]>(T) => void,
  typeahead: string,
  autoFocus: boolean,
}

const TagsInput : FC<Props> = (props: Props) => {
  const [resultTags, setResultTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState(props.tags);
  const [defaultPageTags, setDefaultPageTags] = useState(props.tags);

  // useEffect(() => {
  //   // this.typeahead.getInstance().focus();
  // });

  function handleChange(selected) {
    setSelected(selected);
    props.onTagsUpdated(selected);
  }

  async function handleSearch(query) {
    setIsLoading(true);
    const res = await apiGet('/tags.search', { q: query });
    res.tags.unshift(query); // selectable new tag whose name equals query

    setResultTags(Array.from(new Set(res.tags))); // use Set for de-duplication
    setIsLoading(false);
  }

  function handleSelect(e) {
    if (e.keyCode === 32) { // '32' means ASCII code of 'space'
      e.preventDefault();
      const instance = props.typeahead.getInstance();
      const { initialItem } = instance.state;

      if (initialItem) {
        instance._handleMenuItemSelect(initialItem, e);
      }
    }
  }


  return (
    <div className="tag-typeahead">
      <AsyncTypeahead
        id="tag-typeahead-asynctypeahead"
        // ref={(typeahead) => { props.typeahead = typeahead }}
        caseSensitive={false}
        defaultSelected={defaultPageTags}
        isLoading={isLoading}
        minLength={1}
        multiple
        newSelectionPrefix=""
        onChange={handleChange}
        onSearch={handleSearch}
        onKeyDown={handleSelect}
        options={resultTags} // Search result (Some tag names)
        placeholder="tag name"
        selectHintOnEnter
        autoFocus={props.autoFocus}
      />
    </div>
  );

};

// class DeprecatedTagsInput extends React.Component {

//   constructor(props) {
//     super(props);

//     this.state = {
//       resultTags: [],
//       isLoading: false,
//       selected: this.props.tags,
//       defaultPageTags: this.props.tags,
//     };

//     this.handleChange = this.handleChange.bind(this);
//     this.handleSearch = this.handleSearch.bind(this);
//     this.handleSelect = this.handleSelect.bind(this);
//   }

//   componentDidMount() {
//     this.typeahead.getInstance().focus();
//   }

//   handleChange(selected) {
//     // send tags to TagLabel Component when user add tag to form everytime
//     this.setState({ selected }, () => {
//       this.props.onTagsUpdated(this.state.selected);
//     });
//   }

//   async handleSearch(query) {
//     this.setState({ isLoading: true });
//     const res = await apiGet('/tags.search', { q: query });
//     res.tags.unshift(query); // selectable new tag whose name equals query
//     this.setState({
//       resultTags: Array.from(new Set(res.tags)), // use Set for de-duplication
//       isLoading: false,
//     });
//   }

//   handleSelect(e) {
//     if (e.keyCode === 32) { // '32' means ASCII code of 'space'
//       e.preventDefault();
//       const instance = this.typeahead.getInstance();
//       const { initialItem } = instance.state;

//       if (initialItem) {
//         instance._handleMenuItemSelect(initialItem, e);
//       }
//     }
//   }

//   render() {
//     return (
//       <div className="tag-typeahead">
//         <AsyncTypeahead
//           id="tag-typeahead-asynctypeahead"
//           ref={(typeahead) => { this.typeahead = typeahead }}
//           caseSensitive={false}
//           defaultSelected={this.state.defaultPageTags}
//           isLoading={this.state.isLoading}
//           minLength={1}
//           multiple
//           newSelectionPrefix=""
//           onChange={this.handleChange}
//           onSearch={this.handleSearch}
//           onKeyDown={this.handleSelect}
//           options={this.state.resultTags} // Search result (Some tag names)
//           placeholder="tag name"
//           selectHintOnEnter
//           autoFocus={this.props.autoFocus}
//         />
//       </div>
//     );
//   }

// }

export default TagsInput;
