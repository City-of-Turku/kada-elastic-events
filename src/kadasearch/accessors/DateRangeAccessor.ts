import {
  ObjectState,
  FilterBasedAccessor,
  FilterBucket,
  CardinalityMetric,
  HistogramBucket,
  BoolMust,
  FieldOptions,
  FieldContext,
  FieldContextFactory,
  RangeOption,
  ImmutableQuery
} from "searchkit";

import { DateRangeQuery } from "../query/DateRangeQuery";

import { createEventSortQuery } from '../EventSorting'

const maxBy = require("lodash/maxBy")
const get = require("lodash/get")
const identity = require("lodash/identity")

export interface DateRangeAccessorOptions {
  title:string
  id:string
  fromDate:number | string
  toDate:number | string
  interval?: number
  fromDateField:string
  toDateField:string
  loadHistogram?:boolean
  fieldOptions?:FieldOptions
  rangeFormatter?:(count:number)=> number | string
}

export class DateRangeAccessor extends FilterBasedAccessor<ObjectState> {
  options:DateRangeAccessorOptions
  state = new ObjectState({})
  fieldContext:FieldContext
  rangeFormatter:(count:number)=> number | string

  constructor(key, options:DateRangeAccessorOptions){
    super(key, options.id)
    this.options = options
    this.options.fieldOptions = this.options.fieldOptions || { type:"embedded" }
    this.fieldContext = FieldContextFactory(this.options.fieldOptions)
    this.rangeFormatter = this.options.rangeFormatter || identity
  }

  clearState = () => {
    this.state = this.state.clear()
    console.log("State cleared")
  }

  buildSharedQuery(query) {
    if (this.state.hasValue()) {
      let val:any = this.state.getValue()
      let fromDateRangeFilter = this.fieldContext.wrapFilter(DateRangeQuery(this.options.fromDateField,{
        lte: val.toDate
      }))
      let toDateRangeFilter = this.fieldContext.wrapFilter(DateRangeQuery(this.options.toDateField,{
        gte: val.fromDate
      }))
      const fromVal = this.rangeFormatter(val.fromDate);
      const toVal = this.rangeFormatter(val.toDate);
      const selectedFilterText = (val.toDate)
        ? `${fromVal} – ${toVal}`
        : `${fromVal} –`
      let selectedFilter = {
        name:this.translate(this.options.title),
        value: selectedFilterText,
        id:this.options.id,
        remove:this.clearState
      }

      return query
        .addFilter(this.key, fromDateRangeFilter)
        .addFilter(this.key, toDateRangeFilter)
        .addSelectedFilter(selectedFilter)
    }

    return query
  }

  getBuckets(){
    return this.getAggregations([
      this.key,
      this.fieldContext.getAggregationPath(),
      this.key, "buckets"], [])
  }

  isDisabled() {
    // This accessor is never "disabled"; the calendar should always be visible
    return false
  }

  buildOwnQuery(query) {
    let otherFilters = query.getFiltersWithoutKeys(this.key)
    let filters = BoolMust([
      otherFilters,
      this.fieldContext.wrapFilter(
        DateRangeQuery(this.options.fromDateField, {
          lte: this.options.toDate
        })
      ),
      this.fieldContext.wrapFilter(
        DateRangeQuery(this.options.toDateField, {
          gte: this.options.fromDate
        })
      )
    ])

    query = query.setAggs(FilterBucket(
      this.key,
      filters
    ))

    query = query.setSort(
      createEventSortQuery(this.options.fromDate)
    )

    return query
  }
}