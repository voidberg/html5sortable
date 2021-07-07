/* eslint-env browser */
'use strict'

import { addData as data, removeData } from './data'
import filter from './filter'
import { addEventListener as on, removeEventListener as off } from './eventListener'
import { addAttribute as attr, removeAttribute as removeAttr } from './attribute'
import offset from './offset'
import debounce from './debounce'
import getIndex from './getIndex'
import isInDom from './isInDom'
import { insertBefore as before, insertAfter as after } from './insertHtmlElements'
import serialize from './serialize'
import makePlaceholder from './makePlaceholder'
import getElementHeight from './elementHeight'
import getElementWidth from './elementWidth'
import getHandles from './getHandles'
import getEventTarget from './getEventTarget'
import setDragImage from './setDragImage'
import { default as store, stores } from './store' /* eslint-disable-line */
import listsConnected from './isConnected'
import defaultConfiguration from './defaultConfiguration'
import enableHoverClass from './hoverClass'

/*
 * variables global to the plugin
 */
let dragging
let draggingHeight
let draggingWidth

/*
 * Keeps track of the initialy selected list, where 'dragstart' event was triggered
 * It allows us to move the data in between individual Sortable List instances
 */

// Origin List - data from before any item was changed
let originContainer
let originIndex
let originElementIndex
let originItemsBeforeUpdate

// Previous Sortable Container - we dispatch as sortenter event when a
// dragged item enters a sortableContainer for the first time
let previousContainer

// Destination List - data from before any item was changed
let destinationItemsBeforeUpdate

/**
 * remove event handlers from items
 * @param {Array|NodeList} items
 */
const removeItemEvents = function (items) {
  off(items, 'dragstart')
  off(items, 'dragend')
  off(items, 'dragover')
  off(items, 'dragenter')
  off(items, 'drop')
  off(items, 'mouseenter')
  off(items, 'mouseleave')
}

// Remove container events
const removeContainerEvents = function (originContainer, previousContainer) {
  if (originContainer) {
    off(originContainer, 'dragleave')
  }
  if (previousContainer && (previousContainer !== originContainer)) {
    off(previousContainer, 'dragleave')
  }
}

/**
 * getDragging returns the current element to drag or
 * a copy of the element.
 * Is Copy Active for sortable
 * @param {HTMLElement} draggedItem - the item that the user drags
 * @param {HTMLElement} sortable a single sortable
 */
const getDragging = function (draggedItem, sortable) {
  let ditem = draggedItem
  if (store(sortable).getConfig('copy') === true) {
    ditem = draggedItem.cloneNode(true)
    attr(ditem, 'aria-copied', 'true')
    draggedItem.parentElement.appendChild(ditem)
    ditem.style.display = 'none'
    ditem.oldDisplay = draggedItem.style.display
  }
  return ditem
}
/**
 * Remove data from sortable
 * @param {HTMLElement} sortable a single sortable
 */
const removeSortableData = function (sortable) {
  removeData(sortable)
  removeAttr(sortable, 'aria-dropeffect')
}
/**
 * Remove data from items
 * @param {Array<HTMLElement>|HTMLElement} items
 */
const removeItemData = function (items) {
  removeAttr(items, 'aria-grabbed')
  removeAttr(items, 'aria-copied')
  removeAttr(items, 'draggable')
  removeAttr(items, 'role')
}
/**
 * find sortable from element. travels up parent element until found or null.
 * @param {HTMLElement} element a single sortable
 * @param {Event} event - the current event. We need to pass it to be able to
 * find Sortable whith shadowRoot (document fragment has no parent)
 */
function findSortable (element, event) {
  if (event.composedPath) {
    return event.composedPath().find(el => el.isSortable)
  }
  while (element.isSortable !== true) {
    element = element.parentElement
  }
  return element
}
/**
 * Dragging event is on the sortable element. finds the top child that
 * contains the element.
 * @param {HTMLElement} sortableElement a single sortable
 * @param {HTMLElement} element is that being dragged
 */
function findDragElement (sortableElement, element) {
  const options = data(sortableElement, 'opts')
  const items = filter(sortableElement.children, options.items)
  const itemlist = items.filter(function (ele) {
    return ele.contains(element) || (ele.shadowRoot && ele.shadowRoot.contains(element))
  })

  return itemlist.length > 0 ? itemlist[0] : element
}
/**
 * Destroy the sortable
 * @param {HTMLElement} sortableElement a single sortable
 */
const destroySortable = function (sortableElement) {
  const opts = data(sortableElement, 'opts') || {}
  const items = filter(sortableElement.children, opts.items)
  const handles = getHandles(items, opts.handle)
  // disable adding hover class
  enableHoverClass(sortableElement, false)
  // remove event handlers & data from sortable
  off(sortableElement, 'dragover')
  off(sortableElement, 'dragenter')
  off(sortableElement, 'dragstart')
  off(sortableElement, 'dragend')
  off(sortableElement, 'drop')
  // remove event data from sortable
  removeSortableData(sortableElement)
  // remove event handlers & data from items
  off(handles, 'mousedown')
  removeItemEvents(items)
  removeItemData(items)
  removeContainerEvents(originContainer, previousContainer)
  // clear sortable flag
  sortableElement.isSortable = false
}
/**
 * Enable the sortable
 * @param {HTMLElement} sortableElement a single sortable
 */
const enableSortable = function (sortableElement) {
  const opts = data(sortableElement, 'opts')
  const items = filter(sortableElement.children, opts.items)
  const handles = getHandles(items, opts.handle)
  attr(sortableElement, 'aria-dropeffect', 'move')
  data(sortableElement, '_disabled', 'false')
  attr(handles, 'draggable', 'true')
  // enable hover class
  enableHoverClass(sortableElement, true)
  // @todo: remove this fix
  // IE FIX for ghost
  // can be disabled as it has the side effect that other events
  // (e.g. click) will be ignored
  if (opts.disableIEFix === false) {
    const spanEl = (document || window.document).createElement('span')
    if (typeof spanEl.dragDrop === 'function') {
      on(handles, 'mousedown', function () {
        if (items.indexOf(this) !== -1) {
          this.dragDrop()
        } else {
          let parent = this.parentElement
          while (items.indexOf(parent) === -1) {
            parent = parent.parentElement
          }
          parent.dragDrop()
        }
      })
    }
  }
}
/**
 * Disable the sortable
 * @param {HTMLElement} sortableElement a single sortable
 */
const disableSortable = function (sortableElement) {
  const opts = data(sortableElement, 'opts')
  const items = filter(sortableElement.children, opts.items)
  const handles = getHandles(items, opts.handle)
  attr(sortableElement, 'aria-dropeffect', 'none')
  data(sortableElement, '_disabled', 'true')
  attr(handles, 'draggable', 'false')
  off(handles, 'mousedown')
  enableHoverClass(sortableElement, false)
}
/**
 * Reload the sortable
 * @param {HTMLElement} sortableElement a single sortable
 * @description events need to be removed to not be double bound
 */
const reloadSortable = function (sortableElement) {
  const opts = data(sortableElement, 'opts')
  const items = filter(sortableElement.children, opts.items)
  const handles = getHandles(items, opts.handle)
  data(sortableElement, '_disabled', 'false')
  // remove event handlers from items
  removeItemEvents(items)
  removeContainerEvents(originContainer, previousContainer)
  off(handles, 'mousedown')
  // remove event handlers from sortable
  off(sortableElement, 'dragover')
  off(sortableElement, 'dragenter')
  off(sortableElement, 'drop')
}

/**
 * Public sortable object
 * @param {Array|NodeList} sortableElements
 * @param {object|string} options|method
 */
export default function sortable (sortableElements, options: configuration|object|string|undefined): sortable {
  // get method string to see if a method is called
  const method = String(options)
  options = options || {}
  // check if the user provided a selector instead of an element
  if (typeof sortableElements === 'string') {
    sortableElements = document.querySelectorAll(sortableElements)
  }
  // if the user provided an element, return it in an array to keep the return value consistant
  if (sortableElements instanceof HTMLElement) {
    sortableElements = [sortableElements]
  }

  sortableElements = Array.prototype.slice.call(sortableElements)

  if (/serialize/.test(method)) {
    return sortableElements.map((sortableContainer) => {
      const opts = data(sortableContainer, 'opts')
      return serialize(sortableContainer, opts.itemSerializer, opts.containerSerializer)
    })
  }

  sortableElements.forEach(function (sortableElement) {
    if (/enable|disable|destroy/.test(method)) {
      return sortable[method](sortableElement)
    }
    // log deprecation
    ['connectWith', 'disableIEFix'].forEach((configKey) => {
      if (Object.prototype.hasOwnProperty.call(options, configKey) && options[configKey] !== null) {
        console.warn(`HTML5Sortable: You are using the deprecated configuration "${configKey}". This will be removed in an upcoming version, make sure to migrate to the new options when updating.`)
      }
    })
    // merge options with default options
    options = Object.assign({}, defaultConfiguration, store(sortableElement).config, options)
    // init data store for sortable
    store(sortableElement).config = options
    // set options on sortable
    data(sortableElement, 'opts', options)
    // property to define as sortable
    sortableElement.isSortable = true
    // reset sortable
    reloadSortable(sortableElement)
    // initialize
    const listItems = filter(sortableElement.children, options.items)
    // create element if user defined a placeholder element as a string
    let customPlaceholder
    if (options.placeholder !== null && options.placeholder !== undefined) {
      const tempContainer = document.createElement(sortableElement.tagName)
      if (options.placeholder instanceof HTMLElement) {
        tempContainer.appendChild(options.placeholder)
      } else {
        tempContainer.innerHTML = options.placeholder
      }
      customPlaceholder = tempContainer.children[0]
    }
    // add placeholder
    store(sortableElement).placeholder = makePlaceholder(sortableElement, customPlaceholder, options.placeholderClass)

    data(sortableElement, 'items', options.items)

    if (options.acceptFrom) {
      data(sortableElement, 'acceptFrom', options.acceptFrom)
    } else if (options.connectWith) {
      data(sortableElement, 'connectWith', options.connectWith)
    }

    enableSortable(sortableElement)
    attr(listItems, 'role', 'option')
    attr(listItems, 'aria-grabbed', 'false')
    /*
     Handle drag events on draggable items
     Handle is set at the sortableElement level as it will bubble up
     from the item
     */
    on(sortableElement, 'dragstart', function (e) {
      // ignore dragstart events
      const target = getEventTarget(e)
      if (target.isSortable === true) {
        return
      }
      e.stopImmediatePropagation()

      if ((options.handle && !target.matches(options.handle)) || target.getAttribute('draggable') === 'false') {
        return
      }

      const sortableContainer = findSortable(target, e)
      const dragItem = findDragElement(sortableContainer, target)

      // grab values
      originItemsBeforeUpdate = filter(sortableContainer.children, options.items)
      originIndex = originItemsBeforeUpdate.indexOf(dragItem)
      originElementIndex = getIndex(dragItem, sortableContainer.children)
      originContainer = sortableContainer

      // add transparent clone or other ghost to cursor
      setDragImage(e, dragItem, options.customDragImage)
      // cache selsection & add attr for dragging
      draggingHeight = getElementHeight(dragItem)
      draggingWidth = getElementWidth(dragItem)
      dragItem.classList.add(options.draggingClass)
      dragging = getDragging(dragItem, sortableContainer)
      attr(dragging, 'aria-grabbed', 'true')

      // dispatch sortstart event on each element in group
      sortableContainer.dispatchEvent(new CustomEvent('sortstart', {
        detail: {
          origin: {
            elementIndex: originElementIndex,
            index: originIndex,
            container: originContainer
          },
          item: dragging,
          originalTarget: target
        }
      }))
    })

    /*
     We are capturing targetSortable before modifications with 'dragenter' event
    */
    on(sortableElement, 'dragenter', (e) => {
      const target = getEventTarget(e)
      const sortableContainer = findSortable(target, e)

      if (sortableContainer && sortableContainer !== previousContainer) {
        destinationItemsBeforeUpdate = filter(sortableContainer.children, data(sortableContainer, 'items'))
          .filter(item => item !== store(sortableElement).placeholder)

        if (options.dropTargetContainerClass) {
          sortableContainer.classList.add(options.dropTargetContainerClass)
        }
        sortableContainer.dispatchEvent(new CustomEvent('sortenter', {
          detail: {
            origin: {
              elementIndex: originElementIndex,
              index: originIndex,
              container: originContainer
            },
            destination: {
              container: sortableContainer,
              itemsBeforeUpdate: destinationItemsBeforeUpdate
            },
            item: dragging,
            originalTarget: target
          }
        }))

        on(sortableContainer, 'dragleave', e => {
          // TODO: rename outTarget to be more self-explanatory
          // e.fromElement for very old browsers, similar to relatedTarget
          const outTarget = e.relatedTarget || e.fromElement
          if (!e.currentTarget.contains(outTarget)) {
            if (options.dropTargetContainerClass) {
              sortableContainer.classList.remove(options.dropTargetContainerClass)
            }
            sortableContainer.dispatchEvent(new CustomEvent('sortleave', {
              detail: {
                origin: {
                  elementIndex: originElementIndex,
                  index: originIndex,
                  container: sortableContainer
                },
                item: dragging,
                originalTarget: target
              }
            }))
          }
        })
      }
      previousContainer = sortableContainer
    })

    /*
     * Dragend Event - https://developer.mozilla.org/en-US/docs/Web/Events/dragend
     * Fires each time dragEvent end, or ESC pressed
     * We are using it to clean up any draggable elements and placeholders
     */
    on(sortableElement, 'dragend', function (e) {
      if (!dragging) {
        return
      }

      dragging.classList.remove(options.draggingClass)
      attr(dragging, 'aria-grabbed', 'false')

      if (dragging.getAttribute('aria-copied') === 'true' && data(dragging, 'dropped') !== 'true') {
        dragging.remove()
      }
      if (dragging.oldDisplay !== undefined) {
        dragging.style.display = dragging.oldDisplay
        delete dragging.oldDisplay
      }
      const visiblePlaceholder = Array.from(stores.values()).map(data => data.placeholder)
        .filter(placeholder => placeholder instanceof HTMLElement)
        .filter(isInDom)[0]

      if (visiblePlaceholder) {
        visiblePlaceholder.remove()
      }

      // dispatch sortstart event on each element in group
      sortableElement.dispatchEvent(new CustomEvent('sortstop', {
        detail: {
          origin: {
            elementIndex: originElementIndex,
            index: originIndex,
            container: originContainer
          },
          item: dragging
        }
      }))

      previousContainer = null
      dragging = null
      draggingHeight = null
      draggingWidth = null
    })

    /*
     * Drop Event - https://developer.mozilla.org/en-US/docs/Web/Events/drop
     * Fires when valid drop target area is hit
     */
    on(sortableElement, 'drop', function (e) {
      if (!listsConnected(sortableElement, dragging)) {
        return
      }
      e.preventDefault()
      e.stopPropagation()

      data(dragging, 'dropped', 'true')
      // get the one placeholder that is currently visible
      const visiblePlaceholder = Array.from(stores.values()).map((data) => {
        return data.placeholder
      })
        // filter only HTMLElements
        .filter(placeholder => placeholder instanceof HTMLElement)
        // only elements in DOM
        .filter(isInDom)[0]
      if (visiblePlaceholder) {
        visiblePlaceholder.replaceWith(dragging)
        // to avoid flickering restoring element display immediately after replacing placeholder
        if (dragging.oldDisplay !== undefined) {
          dragging.style.display = dragging.oldDisplay
          delete dragging.oldDisplay
        }
      } else {
        // set the dropped value to 'false' to delete copied dragging at the time of 'dragend'
        data(dragging, 'dropped', 'false')
        return
      }
      /*
       * Fires Custom Event - 'sortstop'
       */
      sortableElement.dispatchEvent(new CustomEvent('sortstop', {
        detail: {
          origin: {
            elementIndex: originElementIndex,
            index: originIndex,
            container: originContainer
          },
          item: dragging
        }
      }))

      const placeholder = store(sortableElement).placeholder
      const originItems = filter(originContainer.children, options.items)
        .filter(item => item !== placeholder)
      const destinationContainer = this.isSortable === true ? this : this.parentElement
      const destinationItems = filter(destinationContainer.children, data(destinationContainer, 'items'))
        .filter(item => item !== placeholder)
      const destinationElementIndex = getIndex(dragging, Array.from(dragging.parentElement.children)
        .filter(item => item !== placeholder))
      const destinationIndex = getIndex(dragging, destinationItems)

      if (options.dropTargetContainerClass) {
        destinationContainer.classList.remove(options.dropTargetContainerClass)
      }

      /*
       * When a list item changed container lists or index within a list
       * Fires Custom Event - 'sortupdate'
       */
      if (originElementIndex !== destinationElementIndex || originContainer !== destinationContainer) {
        sortableElement.dispatchEvent(new CustomEvent('sortupdate', {
          detail: {
            origin: {
              elementIndex: originElementIndex,
              index: originIndex,
              container: originContainer,
              itemsBeforeUpdate: originItemsBeforeUpdate,
              items: originItems
            },
            destination: {
              index: destinationIndex,
              elementIndex: destinationElementIndex,
              container: destinationContainer,
              itemsBeforeUpdate: destinationItemsBeforeUpdate,
              items: destinationItems
            },
            item: dragging
          }
        }))
      }
    })

    const debouncedDragOverEnter = debounce((sortableElement, element, pageX, pageY) => {
      if (!dragging) {
        return
      }

      // set placeholder height if forcePlaceholderSize option is set
      if (options.forcePlaceholderSize) {
        store(sortableElement).placeholder.style.height = draggingHeight + 'px'
        store(sortableElement).placeholder.style.width = draggingWidth + 'px'
      }
      // if element the draggedItem is dragged onto is within the array of all elements in list
      // (not only items, but also disabled, etc.)
      if (Array.from(sortableElement.children).indexOf(element) > -1) {
        const thisHeight = getElementHeight(element)
        const thisWidth = getElementWidth(element)
        const placeholderIndex = getIndex(store(sortableElement).placeholder, element.parentElement.children)
        const thisIndex = getIndex(element, element.parentElement.children)
        // Check if `element` is bigger than the draggable. If it is, we have to define a dead zone to prevent flickering
        if (thisHeight > draggingHeight || thisWidth > draggingWidth) {
          // Dead zone?
          const deadZoneVertical = thisHeight - draggingHeight
          const deadZoneHorizontal = thisWidth - draggingWidth
          const offsetTop = offset(element).top
          const offsetLeft = offset(element).left
          if (placeholderIndex < thisIndex &&
              ((options.orientation === 'vertical' && pageY < offsetTop) ||
                  (options.orientation === 'horizontal' && pageX < offsetLeft))) {
            return
          }
          if (placeholderIndex > thisIndex &&
              ((options.orientation === 'vertical' && pageY > offsetTop + thisHeight - deadZoneVertical) ||
                  (options.orientation === 'horizontal' && pageX > offsetLeft + thisWidth - deadZoneHorizontal))) {
            return
          }
        }

        if (dragging.oldDisplay === undefined) {
          dragging.oldDisplay = dragging.style.display
        }

        if (dragging.style.display !== 'none') {
          dragging.style.display = 'none'
        }
        // To avoid flicker, determine where to position the placeholder
        // based on where the mouse pointer is relative to the elements
        // vertical center.
        let placeAfter = false
        try {
          const elementMiddleVertical = offset(element).top + element.offsetHeight / 2
          const elementMiddleHorizontal = offset(element).left + element.offsetWidth / 2
          placeAfter = (options.orientation === 'vertical' && (pageY >= elementMiddleVertical)) ||
              (options.orientation === 'horizontal' && (pageX >= elementMiddleHorizontal))
        } catch (e) {
          placeAfter = placeholderIndex < thisIndex
        }

        if (placeAfter) {
          after(element, store(sortableElement).placeholder)
        } else {
          before(element, store(sortableElement).placeholder)
        }
        // get placeholders from all stores & remove all but current one
        Array.from(stores.values())
          // remove empty values
          .filter(data => data.placeholder !== undefined)
          // foreach placeholder in array if outside of current sorableContainer -> remove from DOM
          .forEach((data) => {
            if (data.placeholder !== store(sortableElement).placeholder) {
              data.placeholder.remove()
            }
          })
      } else {
        // get all placeholders from store
        const placeholders = Array.from(stores.values())
          .filter((data) => data.placeholder !== undefined)
          .map((data) => {
            return data.placeholder
          })
        // check if element is not in placeholders
        if (placeholders.indexOf(element) === -1 && sortableElement === element && !filter(element.children, options.items).length) {
          placeholders.forEach((element) => element.remove())
          element.appendChild(store(sortableElement).placeholder)
        }
      }
    }, options.debounce)
    // Handle dragover and dragenter events on draggable items
    const onDragOverEnter = function (e) {
      let element = e.target
      const sortableElement = element.isSortable === true ? element : findSortable(element, e)
      element = findDragElement(sortableElement, element)
      if (!dragging || !listsConnected(sortableElement, dragging) || data(sortableElement, '_disabled') === 'true') {
        return
      }
      const options = data(sortableElement, 'opts')
      if (parseInt(options.maxItems) && filter(sortableElement.children, data(sortableElement, 'items')).length > parseInt(options.maxItems) && dragging.parentElement !== sortableElement) {
        return
      }
      e.preventDefault()
      e.stopPropagation()
      e.dataTransfer.dropEffect = store(sortableElement).getConfig('copy') === true ? 'copy' : 'move'
      debouncedDragOverEnter(sortableElement, element, e.pageX, e.pageY)
    }

    on(listItems.concat(sortableElement), 'dragover', onDragOverEnter)
    on(listItems.concat(sortableElement), 'dragenter', onDragOverEnter)
  })

  return sortableElements
}

sortable.destroy = function (sortableElement) {
  destroySortable(sortableElement)
}

sortable.enable = function (sortableElement) {
  enableSortable(sortableElement)
}

sortable.disable = function (sortableElement) {
  disableSortable(sortableElement)
}

/* START.TESTS_ONLY */
sortable.__testing = {
  // add internal methods here for testing purposes
  data: data,
  removeItemEvents: removeItemEvents,
  removeItemData: removeItemData,
  removeSortableData: removeSortableData,
  removeContainerEvents: removeContainerEvents
}
/* END.TESTS_ONLY */
