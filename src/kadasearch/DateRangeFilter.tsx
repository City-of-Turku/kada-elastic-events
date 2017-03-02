import * as React from "react";
const RcCalendar = require("rc-calendar")

import {
  SearchkitManager,
  SearchkitComponent,
  SearchkitComponentProps,
  FastClick,
  RenderComponentType,
  RenderComponentPropType,
  renderComponent,
  FieldOptions,
  Panel, RangeComponentBuilder,
  RangeSliderHistogram, RangeSlider
} from "searchkit"

import { DateRangeAccessor } from "./accessors/DateRangeAccessor"

const defaults = require("lodash/defaults")
const map = require("lodash/map")
const get = require("lodash/get")

export interface DateRangeFilterProps extends SearchkitComponentProps {
  field:string
  min:number | string
  max:number | string
  id:string
  title:string
  interval?:number
  containerComponent?: RenderComponentType<any>
  calendarComponent?: RenderComponentType<any>
  fieldOptions?:FieldOptions
}



export class DateRangeFilter extends SearchkitComponent<DateRangeFilterProps, any> {
  accessor:DateRangeAccessor

  static propTypes = defaults({
    field:React.PropTypes.string.isRequired,
    title:React.PropTypes.string.isRequired,
    id:React.PropTypes.string.isRequired,
    containerComponent:RenderComponentPropType,
    calendarComponent:RenderComponentPropType,
    fieldOptions:React.PropTypes.shape({
      type:React.PropTypes.oneOf(["embedded", "nested", "children"]).isRequired,
      options:React.PropTypes.object
    }),
  }, SearchkitComponent.propTypes)


  static defaultProps = {
    containerComponent: Panel,
    calendarComponent: (props) => {
      let { min, max } = props
      return (
        <div>
          <input id="from" value={min} />
          <input id="to" value={max} />
        </div>
      )
    },
    showHistogram: true,
    fieldOptions: {
      type: 'nested',
      options: {
        path: 'field_event_date'
      }
    }
  }


  constructor(props){
    super(props)
    this.calendarUpdate = this.calendarUpdate.bind(this)
    this.calendarUpdateAndSearch = this.calendarUpdateAndSearch.bind(this)
  }

  defineAccessor() {
    const { id, title, min, max, field, fieldOptions } = this.props
    return new DateRangeAccessor(id,{
      id, min, max, title, field, fieldOptions
    })
  }

  defineBEMBlocks() {
    let block = this.props.mod || "sk-date-range-filter"
    return {
      container: block,
      labels: block+"-value-labels"
    }
  }

  calendarUpdate(newValues) {
    console.log("Calendar update! new values:", newValues)
    if ((newValues.min == this.props.min) && (newValues.max == this.props.max)){
      this.accessor.state = this.accessor.state.clear()
    } else {
      this.accessor.state = this.accessor.state.setValue(newValues)
    }
    this.forceUpdate()
  }

  calendarUpdateAndSearch(newValues) {
    this.calendarUpdate(newValues)
    this.searchkit.performSearch()
  }

  render() {
    const { id, title, containerComponent, calendarComponent} = this.props
    // console.log("Rendering DateRangeFilter", this.props)

    return renderComponent(containerComponent, {
      title,
      className: id ? `filter--${id}` : undefined,
      disabled: this.accessor.isDisabled()
    }, this.renderCalendarComponent(calendarComponent))
  }

  renderCalendarComponent(component: RenderComponentType<any>) {
    const { min, max } = this.props
    const state = this.accessor.state.getValue()
    return renderComponent(component, {
      min, max,
      minValue: Number(get(state, "min", min)),
      maxValue: Number(get(state, "max", max)),
      items: this.accessor.getBuckets(),
      onChange: this.calendarUpdate,
      onFinished: this.calendarUpdateAndSearch
    })
  }

}
