export interface DateRangeQueryOptions {
  lt?:number | string
  lte?:number | string
  gt?:number | string
  gte?:number | string
  boost?:number
  format?:string
  time_zone?:string
}

export function DateRangeQuery(key, options:DateRangeQueryOptions) {
  let query = {
    range: {
      [key]:options
    }
  }

  console.log("DateRangeQuery created:", query)

  return query
}
