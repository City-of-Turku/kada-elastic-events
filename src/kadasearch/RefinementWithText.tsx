import * as React from "react";
import Drupal from "../DrupalSettings";

import {
  ItemHistogramList,
  Pagination,
  Panel,
  RefinementListFilter,
  SearchkitComponent,
  SearchkitComponentProps
} from "searchkit";

export interface RefinementFilterProps extends SearchkitComponentProps {
  id:string
  title:string
  field:string
  operator:string
  description:string
  size?:number
  listComponent?: any
  itemComponent?: any
}

export default class RefinementWithText extends SearchkitComponent<RefinementFilterProps, any> {

  render(){
    return (<div>
      <Panel collapsable={true} defaultCollapsed={true} title={this.props.title}>
        <p>{this.props.description}</p>
        <RefinementListFilter
          id={this.props.id}
          title={this.props.title}
          field={this.props.field}
          operator={this.props.operator}
          size={this.props.size}
          listComponent={this.props.listComponent}
          itemComponent={this.props.itemComponent}
        />
      </Panel>
    </div>)
  }
}
