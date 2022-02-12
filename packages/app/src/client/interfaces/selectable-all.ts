export interface ISelectable {
  select: () => void,
  deselect: () => void,
}

export interface ISelectableAll {
  selectAll: () => void,
  deselectAll: () => void,
}
