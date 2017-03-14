import * as React from "react";
import * as moment from "moment";
import 'rc-calendar/assets/index.css';

import Drupal from "../DrupalSettings.tsx";

declare var window;

moment.locale(Drupal.settings.language)

import {
  SearchkitComponent,
  SearchkitComponentProps
} from "searchkit"

const RcCalendar = require("rc-calendar")
const RangeCalendar = require('rc-calendar/lib/RangeCalendar');
const enUS = require('rc-calendar').enUS;
const DatePicker = require('rc-calendar/lib/Picker');

const format = 'dddd D. MMMM YYYY';
const fullFormat = 'ddd D.M.Y';

export class Picker extends SearchkitComponent<any, any> {
  render() {
    const props = this.props;
    const { showValue } = props;
    const calendar = (
      <RangeCalendar
        type={this.props.type}
        locale={enUS}
        format={format}
        onChange={props.onChange}
        disabledDate={props.disabledDate}
        showToday={true}
        showOk={false}
        showClear={false}
      />);

    return (
      <DatePicker
        prefixCls="sk-calendar-picker"
        open={this.props.open}
        onOpenChange={this.props.onOpenChange}
        calendar={calendar}
        value={props.value}
        dateFormat={format}
      >
        {
          () => (
            <div className="sk-date-box">
              <div className="sk-date-box__text" style={{flex:"1 0 80px"}}>
                {this.props.dateInputPlaceholder}:
              </div>
              <div className="sk-date-box__text" style={{flex:"1 0 50%"}}>
                {showValue && showValue.format(fullFormat)}
              </div>
            </div>
          )
        }
      </DatePicker>);
  }
};


export class DateRangeCalendar extends SearchkitComponent<any, any> {
  refs: {
    [key: string]: any;
    dateFromInput: any;
    dateToInput: any;
  }

  constructor(props) {
    super(props)
    const { fromDate, toDate } = props
    this.state = {
      startValue: fromDate || null,
      endValue: toDate || null,
      startOpen: false,
      endOpen: false,
    }
  }

  onStartOpenChange = (startOpen) => {
    this.setState({
      startOpen,
    });
  }

  onEndOpenChange = (endOpen) => {
    this.setState({
      endOpen,
    });
  }

  onStartChange = (value) => {
    this.setState({
      startOpen: false,
      endOpen: true,
    });
    this.handleChange(value)
  }

  onEndChange = (value) => {
    this.handleChange(value)
  }

  clearState = () => {
    const { onFinished } = this.props
    this.setState({
      startValue: null,
      endValue: null,
    })
    onFinished({
      fromDate: null,
      toDate: null
    })
  }

  disabledPastDate = (endValue) => {
    if (endValue.diff(moment(), 'days') < 0) {
      return true
    }
    return false
  }

  disabledStartDate = (endValue) => {
    if (!endValue) {
      return false;
    }
    const startValue = this.state.startValue;
    if (!startValue) {
      return false;
    }
    return endValue.diff(startValue, 'days') < 0;
  }

  handleChange = (value) => {
    const startValue = value[0]
    const endValue = value[1]
    const { onFinished } = this.props
    // Today's date isn't queried using /d, but everything else is.
    const notToday = startValue > +moment().endOf("day")
                  || startValue < +moment().startOf("day")
    onFinished({
      fromDate: notToday && startValue.startOf("day") || startValue,
      toDate: endValue && endValue.endOf("day")
    })
  }

  render() {
    const state = this.state;
    const { fromDate, toDate, fromDateValue, toDateValue } = this.props

    const fromLabel = window.Drupal.t("From date");
    const toLabel = window.Drupal.t("To date");

    return (
      <div>
        <Picker
          onOpenChange={this.onStartOpenChange}
          open={this.state.startOpen}
          type="start"
          showValue={fromDateValue}
          disabledDate={this.disabledPastDate}
          value={[fromDate, toDate]}
          onChange={this.onStartChange}
          dateInputPlaceholder={fromLabel}
        />
        <Picker
          onOpenChange={this.onEndOpenChange}
          open={this.state.endOpen}
          type="end"
          showValue={toDateValue}
          disabledDate={this.disabledStartDate}
          value={[fromDate, toDate]}
          onChange={this.onEndChange}
          dateInputPlaceholder={toLabel}
        />
      </div>
    )
  }
}

