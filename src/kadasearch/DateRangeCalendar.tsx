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
    const now = moment()
    const calendar = (
      <RangeCalendar
        type={this.props.type}
        locale={enUS}
        defaultValue={[now, null]}
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
    this.state = {
      startValue: null,
      endValue: null,
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
      startValue: value[0],
      startOpen: false,
      endOpen: true,
    });
    this.onFinish({ fromDate: value[0], toDate: this.state.endValue })
  }

  onEndChange = (value) => {
    this.setState({
      endValue: value[1],
    });
    this.onFinish({ fromDate: this.state.startValue, toDate: value[1] })
  }

  clearState = () => {
    this.setState({
      startValue: null,
      endValue: null,
    })
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

  onFinish = (state) => {
    const { fromDate, toDate } = state
    const { onFinished } = this.props
    // Today's date isn't queried using /d, but everything else is.
    const notToday = fromDate > +moment().endOf("day")
                  || fromDate < +moment().startOf("day")
    onFinished({
      fromDate: notToday && (fromDate + "||/d") || +fromDate,
      toDate: (toDate && (toDate + "||/d"))
    })
  }

  render() {
    const { fromDate, toDate } = this.props
    const state = this.state;

    const fromLabel = window.Drupal.t("From date");
    const toLabel = window.Drupal.t("To date");

    return (
      <div>
        <Picker
          onOpenChange={this.onStartOpenChange}
          type="start"
          showValue={state.startValue}
          open={this.state.startOpen}
          value={[state.startValue, state.endValue]}
          onChange={this.onStartChange}
          dateInputPlaceholder={fromLabel}
        />
        <Picker
          onOpenChange={this.onEndOpenChange}
          open={this.state.endOpen}
          type="end"
          showValue={state.endValue}
          disabledDate={this.disabledStartDate}
          value={[state.startValue, state.endValue]}
          onChange={this.onEndChange}
          dateInputPlaceholder={toLabel}
        />
      </div>
    )
  }
}

