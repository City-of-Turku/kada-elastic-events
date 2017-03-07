import * as React from "react";
import { extend } from "lodash"

/**
 * Calculate a sorting term and sort results based on it.
 * This is done to properly sort long events, and to boost long events that
 * are close to their ending date.
 */
export const elapsedSortQuery = {
  "_script" : {
    "type" : "number",
    "script" : {
      "inline": `
        def eventLength = max(_doc.field_event_date_length.value, 60000)
        def eventElapsed = now - _doc.field_event_date_from_millis.value

        def wToday = (eventElapsed > -43200000 && eventElapsed < 0) ? log(-1*eventElapsed/100000) : 0
        def wLength = 1000000000/eventLength
        def wElapsed = eventElapsed/eventLength

        def startedWeight = Math.log(wLength + wElapsed)
        def pendingWeight = wToday + Math.log(-200000000/eventElapsed)

        eventElapsed > 0 ? startedWeight : pendingWeight
      `,
      "params" : {
        "now" : +Date.now()
      }
    },
    "order" : "desc"
  }
}

// Can be used for debugging the sorting.
export const EventSortDebugView = (props) => {
  const { result } = props;
  const source: any = extend({}, result._source, result.highlight);

  const eventLength = Math.max(source.field_event_date_length, 60000)
  const eventElapsed = +Date.now() - source.field_event_date_from_millis

  const wLength = 1000000000/eventLength
  const wElapsed = eventElapsed/eventLength
  const wToday = (eventElapsed > -43200000 && eventElapsed < 0) ? Math.log(-1*eventElapsed/100000) : 0

  const startedWeight = Math.log(wLength + wElapsed)
  const pendingWeight = wToday + Math.log(-200000000/eventElapsed)
  const eventSort = (eventElapsed > 0) ? startedWeight : pendingWeight

  const eventSortTitle = (eventElapsed > 0) ? `started, elapsed ${eventElapsed}` : `waiting to start, elapsed ${eventElapsed}`

  return (
    <div style={{ borderTop: "1px solid black", backgroundColor: (eventElapsed > 0) ? 'rgb(0,255,0)' : 'rgb(255,255,0)', }}>
      <h2><b>{eventSort} - {source.field_date_type} <br/> length {eventLength}, {eventSortTitle}</b></h2>
      <div>wToday {wToday}, wLength {wLength}, wElapsed {wElapsed}</div>
    </div>
  )
}