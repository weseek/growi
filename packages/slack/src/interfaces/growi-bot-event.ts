export interface GrowiBotEvent<T> {
  eventType: string,
  event: T,
  data: {
    [key:string]: any,
  },
}
