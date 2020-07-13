export default class BootstrapGrid {

  constructor(colsRatios, responsiveSize) {
    this.colsRatios = BootstrapGrid.validateColsRatios(colsRatios);
    this.responsiveSize = BootstrapGrid.validateResponsiveSize(responsiveSize);
  }

  static validateColsRatios(colsRatios) {

    if (colsRatios.length === 0) {
      return new Error('Incorrect value');
    }
    let ratiosTotal = 0;
    colsRatios.forEach((ratio) => {
      ratiosTotal += ratio;
    });
    if (ratiosTotal !== 12) {
      return new Error('Incorrect value');
    }

    return colsRatios;
  }

  static validateResponsiveSize(responsiveSize) {
    if (responsiveSize === '' || responsiveSize === 'sm' || responsiveSize === 'md') {
      return responsiveSize;
    }
    return new Error('Incorrect size');
  }

}
