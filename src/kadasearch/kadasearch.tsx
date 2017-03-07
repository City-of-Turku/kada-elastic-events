import * as React from "react";
import { EventListItem } from "./HitItems.tsx";
import Drupal from "../DrupalSettings.tsx";

declare var window;

import {
  SearchBox,
  Hits,
  HitsStats,
  RefinementListFilter,
  ResetFilters,
  GroupedSelectedFilters,
  SearchkitComponent,
  SearchkitProvider,
  SearchkitManager,
  NoHits,
  Pagination,
  RangeFilter,
  ItemHistogramList,
  Layout, LayoutBody, LayoutResults,
  RangeSliderHistogramInput,
  SideBar,
  Panel,
  ActionBar, ActionBarRow,
  FilteredQuery,
  TermQuery
} from "searchkit";

import HierarchicalRefinementFilter from './HierarchicalRefinementFilter'
import { DateRangeFilter } from './DateRangeFilter'
import { SortingSelector } from './SortingSelector'

import { elapsedSortQuery } from './EventSorting'

import "./styles/theme.scss";

const CollapsablePanel = (<Panel collapsable={true} defaultCollapsed={false} />);
const CollapsedPanel = (<Panel collapsable={true} defaultCollapsed={true} />);

let SearchServer = Drupal.settings.elasticServer;
let SearchCalendar = Drupal.settings.currentCalendar;
let SearchLanguage = Drupal.settings.language;
let SearchIndex = SearchCalendar + '_' + SearchLanguage;
let SearchServerURL = SearchServer.replace(/\/$/, '') + '/' + SearchIndex;


export class KadaSearch extends React.Component<any, any> {
  searchkit: SearchkitManager;

  constructor() {
    super();
    // new searchkit Manager connecting to ES server
    const host = SearchServerURL;
    this.searchkit = new SearchkitManager(host, {
      // Disable history for now so text searches don't mess up Drupal with
      // the q parameter in the query string.
      useHistory: false,
    });

    this.searchkit.addDefaultQuery((query)=> {
      return query.addQuery(FilteredQuery({
      }))
    })

    // Attach translations to Drupal
    this.searchkit.translateFunction = (key) => {
      let translations = {
        "searchbox.placeholder": window.Drupal.t("Search"),
        "pagination.previous": window.Drupal.t("Previous"),
        "pagination.next": window.Drupal.t("Next"),
        "reset.clear_all": window.Drupal.t("Clear all filters"),
        "facets.view_more": window.Drupal.t("View more"),
        "facets.view_less": window.Drupal.t("View less"),
        "facets.view_all": window.Drupal.t("View all"),
        "NoHits.NoResultsFound": window.Drupal.t("No results found for {query}"),
        "NoHits.DidYouMean": window.Drupal.t("Search for {suggestion}."),
        "NoHits.SearchWithoutFilters": window.Drupal.t("Search for {query} without filters"),
        "NoHits.NoResultsFoundDidYouMean": window.Drupal.t("No results found for {query}. Did you mean {suggestion}?"),
        "hitstats.results_found": window.Drupal.t("{hitCount} results found in {timeTaken} ms"),
      };
      return translations[key];
    };
  }

  render() {
    return (
      <SearchkitProvider searchkit={this.searchkit}>
        <Layout size="l">
          <LayoutBody>
            <SideBar>
              <SearchBox
                autofocus={false}
                searchOnChange={true}
                queryFields={[
                  "title_field^8",
                  "field_lead_paragraph_et^5",
                  "field_address^13",
                  "field_district^20",
                ]}
                prefixQueryFields={[
                  "title_field^8",
                  "field_lead_paragraph_et^5",
                  "field_address^13",
                  "field_district^20",
                ]}
              />

              <RefinementListFilter
                id="event_types"
                title={window.Drupal.t("What")}
                field="field_event_types"
                operator="AND"
                size={5}
                containerComponent={CollapsedPanel}
                listComponent={ItemHistogramList}
              />

              <RefinementListFilter
                id="target_audience"
                title={window.Drupal.t("For whom")}
                field="field_target_audience"
                operator="AND"
                size={10}
                containerComponent={CollapsedPanel}
                listComponent={ItemHistogramList}
              />

              <RefinementListFilter
                id="district"
                title={window.Drupal.t("Where")}
                field="field_district"
                operator="AND"
                size={10}
                containerComponent={CollapsedPanel}
                listComponent={ItemHistogramList}
              />

              <RefinementListFilter
                id="field_keywords_et"
                title={window.Drupal.t("Keywords")}
                field="field_keywords_et"
                operator="AND"
                size={10}
                containerComponent={CollapsedPanel}
                listComponent={ItemHistogramList}
              />

              <RefinementListFilter
                id="field_date_type"
                title={window.Drupal.t("Date type")}
                field="field_date_type"
                operator="AND"
                size={10}
                listComponent={ItemHistogramList}
              />

              { /*

              See https://www.elastic.co/guide/en/elasticsearch/reference/2.4/common-options.html#date-math

              */ }

              <DateRangeFilter
                id="field_event_date"
                title={window.Drupal.t("When")}
                fromDateField="field_event_date.from"
                toDateField="field_event_date.to"
                fieldOptions={{
                  type: 'nested',
                  options: {
                    path: 'field_event_date'
                  }
                }}
              />

            </SideBar>

            <LayoutResults>

              <ActionBar>
                <ActionBarRow>
                  <GroupedSelectedFilters/>
                  <ResetFilters/>
                </ActionBarRow>
                <ActionBarRow>
                  <HitsStats/>
                  <SortingSelector options={[
                    {
                      label: "Ending soon",
                      query: elapsedSortQuery,
                      defaultOption: true
                    }
                  ]}/>
                </ActionBarRow>
              </ActionBar>

              <Pagination
                showNumbers={true}
                pageScope={2}
              />

              <div className="clearfix">
                <Hits
                  itemComponent={EventListItem}
                  hitsPerPage={10}
                  highlightFields={[
                    "title_field",
                    "field_lead_paragraph_et",
                  ]}
                  scrollTo={false}
                />
              </div>

              <NoHits
                suggestionsField="title_field"
              />

              <Pagination />

            </LayoutResults>
          </LayoutBody>

        </Layout>
      </SearchkitProvider>
    );
  }
}
