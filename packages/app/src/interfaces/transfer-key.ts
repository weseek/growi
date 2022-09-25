export interface ITransferKey<ID = string> {
  _id: ID
  expireAt: Date
  value: string,
}
