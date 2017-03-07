import * as React from "react";

import {
  SearchkitComponent,
  FastClick,
  SearchkitComponentProps,
  renderComponent,
  RenderComponentType,
  RenderComponentPropType,
  Select,
  ListProps
} from "searchkit"

import { defaults, map } from "lodash"

import {
  SortingAccessor,
  SortingOption,
  SortingOptions
} from './accessors/SortingAccessor'

export interface SortingProps extends SearchkitComponentProps {
  options:Array<SortingOption>
  listComponent?: RenderComponentType<ListProps>
}

export class SortingSelector extends SearchkitComponent<SortingProps, any> {
  accessor:SortingAccessor

  static propTypes = defaults({
    listComponent: RenderComponentPropType,
    options:React.PropTypes.arrayOf(
      React.PropTypes.shape({
        label:React.PropTypes.string.isRequired,
        field:React.PropTypes.string,
        order:React.PropTypes.string,
        defaultOption:React.PropTypes.bool,
        query:React.PropTypes.object
      })
    )
  }, SearchkitComponent.propTypes)

  static defaultProps = {
    listComponent: Select
  }

  defineAccessor() {
    return new SortingAccessor("sort", {options:this.props.options})
  }

  toggleItem(key) {
    this.accessor.state = this.accessor.state.setValue(key);
    this.searchkit.performSearch();
  }

  setItems(keys){
    this.toggleItem(keys[0])
  }

  render() {
    const { listComponent } = this.props
    const options = this.accessor.options.options
    const selected = [this.accessor.getSelectedOption().key]
    const disabled = !this.hasHits()

    return renderComponent(listComponent, {
      mod:this.props.mod,
      className:this.props.className,
      items: options,
      selectedItems: selected,
      setItems: this.setItems.bind(this),
      toggleItem: this.toggleItem.bind(this),
      disabled: disabled,
      urlBuilder: (item) => this.accessor.urlWithState(item.key),
      translate:this.translate
    })
  }
}
