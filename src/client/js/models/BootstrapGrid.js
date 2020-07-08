

export default class BootstrapGrid {

  constructor(disSz, offSz, colSz) {
    this.displaySize = disSz;
    this.offsetSize = offSz;
    this.colSize = colSz;

    this.state = {
    };
  }


  getDisplaySize() {
    const displaySize = ['sm', 'md', 'lg', 'xl'];
    return displaySize;
  }

  getColsize() {
    const colSize = [];
    for (let i = 0; i < 12; i++) {
      colSize.push(i);
    }
    return colSize;
  }

  getOffsetSize() {
    const offsetSize = [];
    for (let i = 0; i < 12; i++) {
      offsetSize.push(i);
    }
    return offsetSize;
  }

  getGridInfo(disSz, offSz, colSz) {
    const gridInfo = { displaySize: disSz, offsetSize: offSz, colSize: colSz };
    return gridInfo;
  }

  getGridInfos(gridInfo) {
    const gridInfos = [];
    for (let i = 0; i < gridInfo.length; i++) {
      gridInfos.push(i);
    }
    return gridInfos;
  }

  getRowInfo(gridInfos) {
    const rowInfo = [];
    for (let i = 0; i < gridInfos.length; i++) {
      rowInfo.push(i);
    }
    return rowInfo;
  }

}
