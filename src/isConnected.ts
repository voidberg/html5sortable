import store from './store'
/**
 * Check if curList accepts items from destList
 * @param {sortable} destination the container an item is move to
 * @param {sortable} dom node currently being dragged
 */
export default (destination: sortable, dragging: node) => {
  // check if valid sortable
  if (destination.isSortable === true) {
    const acceptFrom = store(destination).getConfig('acceptFrom')
    // check if acceptFrom is valid
    if (acceptFrom !== null && acceptFrom !== false && typeof acceptFrom !== 'string' && typeof acceptFrom !== 'function') {
      throw new Error('HTML5Sortable: Wrong argument, "acceptFrom" must be "null", "false", or a valid selector string.')
    }

    if (acceptFrom !== null) {
      if (typeof acceptFrom === 'function') {
         return acceptFrom(destination, dragging);
      } else {
         return acceptFrom !== false && acceptFrom.split(',').filter(function (sel) {
            return sel.length > 0 && dragging.parentElement.matches(sel)
         }).length > 0
      }
    }
    // drop in same list
    if (destination === dragging.parentElement) {
      return true
    }
    // check if lists are connected with connectWith
    if ((store(destination).getConfig('connectWith') !== undefined && store(destination).getConfig('connectWith') !== null) && store(dragging.parentElement).getConfig('connectWith') !== undefined && store(dragging.parentElement).getConfig('connectWith') !== null) {
      return store(destination).getConfig('connectWith') === store(dragging.parentElement).getConfig('connectWith')
    }
  }
  return false
}
