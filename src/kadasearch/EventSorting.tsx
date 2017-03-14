import * as React from "react"
import * as moment from "moment"
import { extend } from "lodash"

export const createEventSortQuery = (now:moment.Moment = moment()) => {
  return {
    "_script": {
      "script": {
        "lang": "groovy",
        "file": "weightedEventSort",
        "params": {
          "queryNow": now.toISOString()
        },
      },
      "type": "number",
      "order": "desc"
    }
  }
}
