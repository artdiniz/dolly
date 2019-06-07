export function partition<T>(
  isYes: (el: T, position: number, list: T[]) => boolean
) {
  return (
    yesAndNoArray: T | [T[], T[]],
    _currentItem: T,
    _position: number,
    _list: T[]
  ) => {
    if (Array.isArray(yesAndNoArray)) {
      const [yes = [], no = []] = yesAndNoArray
      isYes(_currentItem, _position, _list)
        ? yes.push(_currentItem)
        : no.push(_currentItem)
      return yesAndNoArray
    } else {
      const firstItem = yesAndNoArray
      const secondItem = _currentItem

      const newYesAndNoArray = [[], []] as [T[], T[]]
      const [yes = [], no = []] = newYesAndNoArray

      isYes(firstItem, _position, _list) ? yes.push(firstItem) : no.push(firstItem)

      isYes(secondItem, _position, _list)
        ? yes.push(secondItem)
        : no.push(secondItem)

      return newYesAndNoArray
    }
  }
}
