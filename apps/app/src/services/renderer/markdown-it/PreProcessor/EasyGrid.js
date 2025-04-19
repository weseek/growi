export default class EasyGrid {

  process(markdown) {
    // see: https://regex101.com/r/7NWvUU/2
    return markdown.replace(/:::\s*editable-row[\r\n]((.|[\r\n])*?)[\r\n]:::/gm, (_all, group) => {
      return group;
    });
  }

}
