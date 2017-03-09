import * as React from "react"
import { extend } from "lodash"

export const createEventSortQuery = (now:string | number = +Date.now()) => {
  return {
    "_script": {
      "script": {
        "lang": "groovy",
        "file": "weightedEventSort",
        "params": {
          "queryNow": now
        },
      },
      "type": "number",
      "order": "desc"
    }
  }
}
