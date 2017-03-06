import { AggsContainer } from 'searchkit'

const assign = require("lodash/assign")

export interface DateRangeMetricOptions{
  fromDate?:number | string
  toDate?:number | string
  fromDateField?:string
  toDateField?:string
}

export function DateRangeMetric(key, opts:DateRangeMetricOptions){
  const aggs = AggsContainer(key, { opts })
  console.log("⭕⭕⭕️️  MetricAggs", aggs)
  return aggs;
}
