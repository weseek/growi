import React from 'react';
import PropTypes from 'prop-types';

import PageComments from './PageComments';

/**
 * Set the behavior that post comments to #page-comment-form
 *
 * This is transplanted from legacy/crowi.js -- 2017.06.03 Yuki Takei
 *
 * @author Yuki Takei <yuki@weseek.co.jp>
 *
 * @export
 * @class PageCommentFormBehavior
 * @extends {React.Component}
 */
export default class PageCommentFormBehavior extends React.Component {

  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const pageComments = this.props.pageComments;

    if (pageComments === undefined) {
      return;
    }

    $('#page-comment-form').on('submit', function() {
      var $button = $('#comment-form-button');
      $button.attr('disabled', 'disabled');
      $.post('/_api/comments.add', $(this).serialize(), function(data) {
        $button.prop('disabled', false);
        if (data.ok) {

          // reload comments
          pageComments.init();

          $('#comment-form-comment').val('');
          $('#comment-form-message').text('');
        } else {
          $('#comment-form-message').text(data.error);
        }
      }).fail(function(data) {
        if (data.status !== 200) {
          $('#comment-form-message').text(data.statusText);
        }
      });

      return false;
    });
  }

  render() {
    // render nothing
    return <div></div>
  }
}

PageCommentFormBehavior.propTypes = {
  pageComments: PropTypes.instanceOf(PageComments),
  crowi: PropTypes.object.isRequired,
};
