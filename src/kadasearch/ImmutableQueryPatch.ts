import { BoolMust, SelectedFilter } from "searchkit"
var omitBy = require("lodash/omitBy");
var omit = require("lodash/omit");
var values = require("lodash/values");
var pick = require("lodash/pick");
var merge = require("lodash/merge");
var isUndefined = require("lodash/isUndefined");
let ImmutableQuery = require('searchkit').ImmutableQuery

/**
 * Patches Searchkit core ImmutableQuery to support ES script_fields.
 * This is needed so we can use ES script plugins to implement sorting.
 */
export function ImmutableQueryPatch() {
  ImmutableQuery.prototype.buildQuery = function () {
    var query:any = {};
    if (this.index.queries.length > 0) {
      query.query = BoolMust(this.index.queries);
    }
    if (this.index.filters.length > 0) {
      query.filter = BoolMust(this.index.filters);
    }
    if (this.index.script_fields.length > 0) {
      query.script_fields = BoolMust(this.index.script_fields);
    }
    query.aggs = this.index.aggs;
    query.size = this.index.size;
    query.from = this.index.from;
    query.sort = this.index.sort;
    query.highlight = this.index.highlight;
    query.suggest = this.index.suggest;
    if (this.index._source) {
      query._source = this.index._source;
    }
    this.query = omitBy(query, isUndefined);
  };
  ImmutableQuery.prototype.addScriptField = function (query) {
    if (!query) {
      return this;
    }
    return this.update({
      script_fields: { $push: [query] }
    });
  };
  ImmutableQuery.defaultIndex = {
    queryString: "",
    filtersMap: {},
    selectedFilters: [],
    queries: [],
    filters: [],
    script_fields: [],
    _source: null,
    size: 0
  };
}