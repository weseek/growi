
export default class ImageExpander {

  process(markdown) {

    return markdown
      .replace(/\s(https?:\/\/[\S]+\.(jpg|jpeg|gif|png))/g, ' <a href="$1"><img src="$1" class="auto-expanded-image"></a>');
  }
}
