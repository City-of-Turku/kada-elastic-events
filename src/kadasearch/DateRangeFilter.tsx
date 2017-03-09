import * as React from "react";
import * as moment from "moment";


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
  fromDateField:string
  toDateField:string
  fromDate?:number | string
  toDate?:number | string
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
    fromDate:React.PropTypes.string,
    toDate:React.PropTypes.string,
    fromDateField:React.PropTypes.string.isRequired,
    toDateField:React.PropTypes.string.isRequired,
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
    fromDate: 'now',
    toDate: 'now/d',
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
      fromDateField,
      toDateField,
      fieldOptions,
    } = this.props

    return new DateRangeAccessor(id, {
      id,
      fromDate,
      toDate,
      fromDateField,
      toDateField,
      title,
      fieldOptions
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
    if (!newValues.fromDate && !newValues.toDate) {
      this.accessor.state = this.accessor.state.clear()
    }
    else {
      this.accessor.state = this.accessor.state.setValue(newValues)
    }
    this.forceUpdate()
  }

  calendarUpdateAndSearch(newValues) {
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
    const { fromDate, toDate } = this.props
    const state = this.accessor.state.getValue()

    return renderComponent(component, {
      fromDate: get(state, "fromDate", fromDate),
      toDate: get(state, "toDate", toDate),
      items: this.accessor.getBuckets(),
      onChange: this.calendarUpdate,
      onFinished: this.calendarUpdateAndSearch
    })
  }

}
