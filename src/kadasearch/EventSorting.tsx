import * as React from "react"
import { extend } from "lodash"

/**
 * Calculate a sorting term and sort results based on it.
 * This is done to properly sort long events, and to boost long events that
 * are close to their ending date.
 */
export const createEventSortScriptFieldQuery = (now:string | number = +Date.now()) => {
  return {
    "event_weighted": {
      "script": {
        "inline": "eventsort",
        "lang": "native",
        "params": {
          "now": now
        }
      }
    }
  }
}

// Can be used for debugging the sorting.
export const EventSortDebugView = (props) => {
  const { result } = props;
  const source: any = extend({}, result._source, result.highlight);

  // console.log(props)

  const begin = +Date.now()

  const eventLength = Math.max(source.field_event_date_length, 60000)
  const eventElapsed = begin - source.field_event_date_from_millis

  const wToday = (eventElapsed > -43200000 && eventElapsed < 0) ? (43200000+eventElapsed)/3000 : 0
  const wLength = 1000000000/eventLength
  const wElapsed = eventElapsed/eventLength

  const startedWeight = Math.log(wLength + wElapsed)
  const pendingWeight = Math.log(wToday + -200000000/eventElapsed)
  const eventSort = (eventElapsed > 0) ? startedWeight : pendingWeight

  const eventSortTitle = (eventElapsed > 0) ? `started, elapsed ${eventElapsed}` : `waiting to start, elapsed ${eventElapsed}`

  return (
    <div style={{ borderTop: "1px solid black", backgroundColor: (eventElapsed > 0) ? 'rgb(0,255,0)' : 'rgb(255,255,0)', }}>
      <h2><b>{eventSort} - {source.field_date_type} <br/> length {eventLength}, {eventSortTitle}</b></h2>
      <div>wToday {wToday}, wLength {wLength}, wElapsed {wElapsed}</div>
    </div>
  )
}