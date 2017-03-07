export class LsxPreProcessor {
  process(markdown) {
    return markdown
      // see: https://regex101.com/r/NQq3s9/2
      .replace(/\$lsx\((.*)\)/g, function(all, group1) {
        return `$lsx tag called!! (option='${group1}')`;
      });
  }
}
