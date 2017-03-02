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
  fromDate?:number | string
  toDate?:number | string
  initialFromDate?:number | string
  initialToDate?:number | string
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
    showHistogram: true,
    initialFromDate: 'now/d',
    initialToDate: 'now+7d/d',
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
    const {
      id,
      title,
      fromDate,
      toDate,
      field,
      fieldOptions,
    } = this.props

    return new DateRangeAccessor(id, {
      id, fromDate, toDate, title, field, fieldOptions
    })
  }

  defineBEMBlocks() {
    let block = this.props.mod || "sk-date-range-filter"
    return {
      container: block,
      labels: block+"-value-labels"
    }
  }

  componentWillMount() {
    super.componentWillMount()
  }

  componentDidUpdate() {
    const { fromDate, toDate } = this.props
    this.accessor.state = this.accessor.state.setValue({ fromDate, toDate })
  }

  calendarUpdate(newValues) {
    if (!newValues.fromDate && !newValues.toDate) {
      this.accessor.state = this.accessor.state.clear()
    }
    else {
      console.log("Calendar update! new values:", newValues)
      this.accessor.state = this.accessor.state.setValue(newValues)
    }
    this.forceUpdate()
  }

  calendarUpdateAndSearch(newValues) {
    this.calendarUpdate(newValues)
    this.searchkit.performSearch()
  }

  getCalendarComponent() {
    return (props) => {
      const { fromDate, toDate, onChange, onFinished } = props
      console.log("PROPS", props)

      const handleFromDateChange = (event) => {
        const newState = { fromDate: event.target.value, toDate: toDate }
        onChange(newState)
      }
      const handleToDateChange = (event) => {
        const newState = { fromDate: fromDate, toDate: event.target.value }
        onChange(newState)
      }
      const handleDateFinished = (event) => {
        const newState = { fromDate: fromDate, toDate: toDate }
        onFinished(newState)
      }
      return (
        <div>
          <input id="date-from" onChange={handleFromDateChange} defaultValue={fromDate} />
          <input id="date-to" onChange={handleToDateChange} defaultValue={toDate} />
          <button id="date-submit" onClick={handleDateFinished}>OK</button>
        </div>
      )
    }
  }

  render() {
    const { id, title, containerComponent, calendarComponent} = this.props
    console.log("Rendering DateRangeFilter", this.props)

    return renderComponent(containerComponent, {
      title,
      className: id ? `filter--${id}` : undefined,
      disabled: this.accessor.isDisabled()
    }, this.renderCalendarComponent(this.getCalendarComponent()))
  }

  renderCalendarComponent(component: RenderComponentType<any>) {
    const { fromDate, toDate, initialFromDate, initialToDate } = this.props
    const state = this.accessor.state.getValue()

    console.log("Rendering calendar component", state)

    return renderComponent(component, {
      fromDate: get(state, "fromDate", initialFromDate),
      toDate: get(state, "toDate", initialToDate),
      items: this.accessor.getBuckets(),
      onChange: this.calendarUpdate,
      onFinished: this.calendarUpdateAndSearch
    })
  }

}
