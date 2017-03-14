import * as React from "react";
import * as moment from "moment";


import {
  SearchkitComponent,
  SearchkitComponentProps,
  FastClick,
  RenderComponentType,
  RenderComponentPropType,
  renderComponent,
  FieldOptions,
  Panel
} from "searchkit"

import {
  defaults,
  map,
  get
} from "lodash"

import { DateRangeAccessor } from "./accessors/DateRangeAccessor"

export class DateRangeFilterInput extends SearchkitComponent<any, any> {
  refs: {
    [key: string]: any;
    dateFromInput: any;
    dateToInput: any;
  }

  handleDateFinished = (event) => {
    const { onFinished } = this.props
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
  fromDateField:string
  toDateField:string
  fromDate?:moment.Moment
  toDate?:moment.Moment
  id:string
  title:string
  interval?:number
  containerComponent?: RenderComponentType<any>
  calendarComponent?: RenderComponentType<any>
  rangeFormatter?:(count:number)=> number | string
  fieldOptions?:FieldOptions
}


export class DateRangeFilter extends SearchkitComponent<DateRangeFilterProps, any> {
  accessor:DateRangeAccessor


  static propTypes = defaults({
    fromDate:React.PropTypes.object,
    toDate:React.PropTypes.object,
    fromDateField:React.PropTypes.string.isRequired,
    toDateField:React.PropTypes.string.isRequired,
    title:React.PropTypes.string.isRequired,
    id:React.PropTypes.string.isRequired,
    containerComponent:RenderComponentPropType,
    calendarComponent:RenderComponentPropType,
    rangeFormatter:React.PropTypes.func,
    fieldOptions:React.PropTypes.shape({
      type:React.PropTypes.oneOf(["embedded", "nested", "children"]).isRequired,
      options:React.PropTypes.object
    }),
  }, SearchkitComponent.propTypes)


  static defaultProps = {
    containerComponent: Panel,
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
  }

  defineAccessor() {
    const {
      id,
      title,
      fromDate,
      toDate,
      fromDateField,
      toDateField,
      fieldOptions,
      rangeFormatter,
    } = this.props

    return new DateRangeAccessor(id, {
      id,
      fromDate,
      toDate,
      fromDateField,
      toDateField,
      title,
      fieldOptions,
      rangeFormatter,
      onClearState: this.handleClearState
    })
  }

  handleClearState = () => {
    this.accessor.resetState()
  }

  defineBEMBlocks() {
    let block = this.props.mod || "sk-date-range-filter"
    return {
      container: block,
      labels: block+"-value-labels"
    }
  }

  calendarUpdate = (newValues) => {
    this.setCalendarState(newValues)
    this.forceUpdate()
  }

  setCalendarState = (newValues) => {
    if (!newValues.fromDate) {
      this.accessor.resetState()
    }
    else {
      this.accessor.state = this.accessor.state.setValue(newValues)
    }
  }

  calendarUpdateAndSearch = (newValues) => {
    this.calendarUpdate(newValues)
    this.searchkit.performSearch()
  }

  getCalendarComponent() {
    const { calendarComponent } = this.props
    return (calendarComponent || DateRangeFilterInput)
  }

  render() {
    const { id, title, containerComponent } = this.props

    return renderComponent(containerComponent, {
      title,
      className: id ? `filter--${id}` : undefined,
      disabled: this.accessor.isDisabled()
    }, this.renderCalendarComponent(this.getCalendarComponent()))
  }

  renderCalendarComponent(component: RenderComponentType<any>) {
    const { fromDate, toDate, rangeFormatter } = this.props
    const state:{ fromDate?:string, toDate?:string } = this.accessor.state.getValue()

    return renderComponent(component, {
      fromDate: state.fromDate,
      toDate: state.toDate,
      fromDateValue: get(state, "fromDate", fromDate),
      toDateValue: get(state, "toDate", toDate),
      items: this.accessor.getBuckets(),
      onChange: this.setCalendarState,
      onFinished: this.calendarUpdateAndSearch,
      rangeFormatter
    })
  }

}
