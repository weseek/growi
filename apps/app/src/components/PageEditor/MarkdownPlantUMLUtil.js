/**
 * Utility for PlantUML in markdown
 */

class MarkdownPlantUMLUtil {

  constructor() {
    this.lineBeginPartOfPlantUMLRE = /^```(\s.*)plantuml$/;
    this.lineEndPartOfPlantUMLRE = /^```$/;
  }

  /**
   * Finds all PlantUML sections in the markdown and returns an array of their starting line numbers.
   */
  findAllPlantUMLSections(editor) {
    const lineNumbers = [];
    for (let i = editor.firstLine(), e = editor.lastLine(); i <= e; i++) {
      const line = editor.getLine(i);
      const match = this.lineBeginPartOfPlantUMLRE.exec(line);
      if (match) {
        lineNumbers.push(i);
      }
    }
    return lineNumbers;
  }
}

const instance = new MarkdownPlantUMLUtil();
Object.freeze(instance);
export default instance;
