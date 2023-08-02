interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export interface PopperData {
  styles: Partial<CSSStyleDeclaration>;
  offsets: {
    popper: Rect;
    reference: Rect;
    arrow: { top: number; left: number };
  };
}

export interface CustomModifiers {
  applyStyle?: {
    enabled: boolean
  }
  computeStyle?: {
    enabled: boolean,
    fn: (data: PopperData) => PopperData
  }
  preventOverflow: {
    boundariesElement: string
  }
}
