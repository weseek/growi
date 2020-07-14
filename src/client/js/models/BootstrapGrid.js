export default class BootstrapGrid {

  constructor(colsRatios, responsiveSize) {
    this.colsRatios = BootstrapGrid.validateColsRatios(colsRatios);
    this.responsiveSize = BootstrapGrid.validateResponsiveSize(responsiveSize);
  }

  static ResponsiveSize = {
    XS_SIZE: 'xs', SM_SIZE: 'sm', MD_SIZE: 'md',
  }

  static validateColsRatios(colsRatios) {

    if (colsRatios.length < 2) {
      return new Error('Incorrect array length of cols ratios');
    }
    let ratiosTotal = 0;
    colsRatios.forEach((ratio) => {
      ratiosTotal += ratio;
    });
    if (ratiosTotal !== 12) {
      return new Error('Incorrect cols ratios value');
    }

    return colsRatios;
  }

  static validateResponsiveSize(responsiveSize) {
    if (responsiveSize === this.ResponsiveSize.XS_SIZE || responsiveSize === this.ResponsiveSize.SM_SIZE || responsiveSize === this.ResponsiveSize.MD_SIZE) {
      return responsiveSize;
    }
    return new Error('Incorrect responsive size');
  }

}
