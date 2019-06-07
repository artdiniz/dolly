const biggestStringReducer = (_biggestString = '', name: string) =>
  name.length > _biggestString.length ? name : _biggestString

export function biggestStringIn(stringList: string[]) {
  return stringList.reduce(biggestStringReducer)
}
