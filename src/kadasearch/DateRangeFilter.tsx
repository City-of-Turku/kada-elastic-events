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

export class DateRangeFilterInput extends SearchkitComponent<any, any> {
  refs: {
    [key: string]: any;
    dateFromInput: any;
    dateToInput: any;
  }

  constructor(props) {
    super(props)
    const { fromDate, toDate } = props
    console.log("PROPS", props)
  }

  handleDateFinished = (event) => {
    const { onFinished } = this.props
    console.log("handleDateFinished")
    const newState = { fromDate: this.refs.dateFromInput.value, toDate: this.refs.dateToInput.value }
    onFinished(newState)
  }

  render() {
    const { fromDate, toDate } = this.props

    return (
      <div>
        <input id="date-from" ref="dateFromInput" defaultValue={fromDate} />
        <input id="date-to" ref="dateToInput" defaultValue={toDate} />
        <button id="date-submit" onClick={this.handleDateFinished}>OK</button>
      </div>
    )
  }
}






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

  componentDidMount() {
    this.setInitialState()
  }

  setInitialState() {
    this.accessor.state = this.accessor.state.setValue({
      fromDate: this.props.initialFromDate,
      toDate: this.props.initialToDate
    })
  }

  calendarUpdate(newValues) {
    if (!newValues.fromDate && !newValues.toDate) {
      this.accessor.state = this.accessor.state.clear()
      console.log("Calendar state cleared")
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
    return (DateRangeFilterInput)
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
