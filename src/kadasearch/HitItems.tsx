import { extend } from "lodash";
import * as React from "react";
import Drupal from "../DrupalSettings";

import {
  TagFilterList
} from "searchkit"

declare var window;

const EventGridItem = (props) => {
  const {bemBlocks, result} = props;
  let url = "http://www.imdb.com/title/" + result._source.imdbId;
  const source: any = extend({}, result._source, result.highlight);
  return (
    <div className={bemBlocks.item().mix(bemBlocks.container("item"))} data-qa="hit">
      <a href={url} target="_blank">
        <img data-qa="poster" className={bemBlocks.item("poster")} src={result._source.field_content_image_et_url} width="170" height="240"/>
        <div data-qa="title_field.original" className={bemBlocks.item("title_field.original")} dangerouslySetInnerHTML={{__html:source.title_field.original}}>
        </div>
      </a>
    </div>
  );
};

const EventListItem = (props) => {
  const {bemBlocks, result} = props;
  const source: any = extend({}, result._source, result.highlight);

  // If there's an url in the index, use it. Otherwise, fall back to Drupal node-id.
  const url = (source.url) ? source.url : '/node/' + result._id
  const image = (source.field_content_image_et_url) ? (
    <div className="event__image__wrapper">
      <img src={source.field_content_image_et_url} width="231" height="231" alt="" />
    </div>
  ) : null;
  const title = (source.title_field) ? source.title_field : null;
  const leading = (source.field_lead_paragraph_et) ? source.field_lead_paragraph_et : null;

  const place = (source.relation_place_service_node) ? (
    <div className="event__place">
      <ul className="links">
        <li className="0 first last">
          <a href={source.relation_place_service_node.url}>
            {source.relation_place_service_node.title}
          </a>
        </li>
      </ul>
    </div>
  ) : null;

  const dateVignette = (source.field_date_vignette) ? (
    <div className="date__vignette">{source.field_date_vignette}</div>
  ) : null;

  const prettyDates = (source.field_event_date_pretty) ? (
    <div className="event__date">
      {source.field_event_date_pretty}
      {dateVignette}
    </div>
  ) : null;

  const signupBeforeLabel = window.Drupal.t("Last day to sign up");
  const signupBefore = (source.field_last_day_to_sign_up_pretty) ? (
    <div className="event__signup">
      <div className="label-inline signup__label">
        {signupBeforeLabel}
      </div>
      <span className="date-display-single">
        {source.field_last_day_to_sign_up_pretty}
      </span>
    </div>
  ) : null;

  const trafficLight = (() => {
    const ticketInformation = (source.field_ticket_information) ? source.field_ticket_information.split('-') : null;
    if (ticketInformation) {
      const totalTickets = parseInt(ticketInformation[0]);
      const availableTickets = parseInt(ticketInformation[3]);
      const percentage = 0;
      let color = '';
      let text = '';
      const prefix = window.Drupal.t("Estimate of ticket availability: ");

      // Sanity check.
      if (totalTickets && availableTickets && totalTickets >= availableTickets) {
        const percentage = ((availableTickets / totalTickets) * 100)
        if (percentage <= 5) {
          color = 'red';
          text = window.Drupal.t('Almost sold out');
        } else if (percentage > 5 && percentage <= 30) {
          color = 'orange';
          text = window.Drupal.t('Few tickets available');
        } else {
          color = 'green';
          text = window.Drupal.t('Tickets available');
        }

        const className = `traffic-light-${color}`

        return { className, color, text }
      }
    }
  })()

  const trafficLightClass = (trafficLight) ? trafficLight.className : null;
  const trafficLightText = (trafficLight) ? trafficLight.text : null;

  const tickets = source.field_event_tickets_url_et;
  const ticketsLink = (tickets) ? (
    <div className="event__ticket_wrapper">
      <div className={['event__ticket', trafficLightClass].join(' ')} title={trafficLightText}>
        <a href={tickets.url} target="_blank" rel="noopener">
          Osta liput
        </a>
      </div>
    </div>
  ): null;

  const eventTypes = (<TagFilterList field="field_event_types" values={source.field_event_types} />)

  let isRenderable = (title !== null);
  return (isRenderable) ? (
    <div className="event event--list">
      {image}
      <div className="event__content__wrapper">
        <h2 className="event__title">
          <a href={url} dangerouslySetInnerHTML={{__html:title}}></a>
        </h2>
        {place}
        {prettyDates}
        {signupBefore}
        <div className="event__leading" dangerouslySetInnerHTML={{__html:leading}}></div>
        {ticketsLink}
      </div>
      <div className="event__information__wrapper">
        <div className="event__types">
          {eventTypes}
        </div>
      </div>
    </div>
  )
  :
  (
    <div className="event event--list">
      <i>{ window.Drupal.t("We were unable to display event id @id. Sorry!", { "@id": result._id }) }</i>
    </div>
  );
};

export { EventGridItem, EventListItem }
