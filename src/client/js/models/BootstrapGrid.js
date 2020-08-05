export default class BootstrapGrid {

  constructor(colsRatios, responsiveSize) {
    this.colsRatios = BootstrapGrid.validateColsRatios(colsRatios);
    this.responsiveSize = BootstrapGrid.validateResponsiveSize(responsiveSize);
  }

  static ResponsiveSize = {
    XS_SIZE: 'smartphone', SM_SIZE: 'tablet', MD_SIZE: 'desktop',
  }

  static validateColsRatios(colsRatios) {

    if (colsRatios.length < 2 || colsRatios.length > 4) {
      throw new Error('Incorrect array length of cols ratios');
    }
    const ratiosTotal = colsRatios.reduce((total, ratio) => { return total + ratio }, 0);
    if (ratiosTotal !== 12) {
      throw new Error('Incorrect cols ratios value');
    }

    return colsRatios;
  }

  static validateResponsiveSize(responsiveSize) {
    if (responsiveSize === this.ResponsiveSize.XS_SIZE || responsiveSize === this.ResponsiveSize.SM_SIZE || responsiveSize === this.ResponsiveSize.MD_SIZE) {
      return responsiveSize;
    }
    throw new Error('Incorrect responsive size');
  }

}
