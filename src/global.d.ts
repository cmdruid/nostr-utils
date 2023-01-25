declare global {
  interface Set<T> {
    has : (elem : T) => elem is T & ((elem : any) => boolean)
  }
  interface Map<K, V> {
    has : (key : K) => V & ((elem : any) => boolean)
  }
}
