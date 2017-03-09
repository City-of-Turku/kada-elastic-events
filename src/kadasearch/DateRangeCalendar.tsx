import * as React from "react";
import * as moment from "moment";
import 'rc-calendar/assets/index.css';

import Drupal from "../DrupalSettings.tsx";

moment.locale(Drupal.settings.language)

import {
  SearchkitComponent,
  SearchkitComponentProps
} from "searchkit"

const RcCalendar = require("rc-calendar")
const RangeCalendar = require('rc-calendar/lib/RangeCalendar');
const enUS = require('rc-calendar').enUS;
const DatePicker = require('rc-calendar/lib/Picker');

const format = 'YYYY-MM-DD';
const fullFormat = 'dddd D.M.Y';

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
        showOk={true}
        showClear={true}
      />);
    return (
      <DatePicker
        open={this.props.open}
        onOpenChange={this.props.onOpenChange}
        calendar={calendar}
        value={props.value}
      >
        {
          () => (
            <span>
              <input
                placeholder={this.props.dateInputPlaceholder}
                style={{ width: 250 }}
                readOnly
                value={showValue && showValue.format(fullFormat) || ''}
              />
            </span>
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
    onFinished({ fromDate, toDate: (toDate && (toDate + "||/d")) })
  }

  render() {
    const { fromDate, toDate } = this.props
    const state = this.state;

    return (
      <div>
        <Picker
          onOpenChange={this.onStartOpenChange}
          type="start"
          showValue={state.startValue}
          open={this.state.startOpen}
          value={[state.startValue, state.endValue]}
          onChange={this.onStartChange}
          dateInputPlaceholder={"Alku"}
        />
        <Picker
          onOpenChange={this.onEndOpenChange}
          open={this.state.endOpen}
          type="end"
          showValue={state.endValue}
          disabledDate={this.disabledStartDate}
          value={[state.startValue, state.endValue]}
          onChange={this.onEndChange}
          dateInputPlaceholder={"Loppu"}
        />
      </div>
    )
  }
}

