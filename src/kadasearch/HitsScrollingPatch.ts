var offset = require('document-offset');
let HitsAccessor = require('searchkit').HitsAccessor

/**
 * Patches Searchkit core HitsAccessor to be able to scroll to any element, not
 * just top of body.
 */
export function HitsScrollingPatch() {
  HitsAccessor.prototype.getScrollSelector = function () {
    return (this.options.scrollTo === true) ?
      "body" :
      this.options.scrollTo.toString();
  };
  HitsAccessor.prototype.scrollIfNeeded = function () {
    if (!this.searchkit.initialLoading && this.searchkit.hasHitsChanged()) {
      if (this.options.scrollTo) {
        var searchkitOffset = offset(document.querySelector(this.getScrollSelector()))
        document.body.scrollTop = searchkitOffset.top;
      }
    }
  };
}