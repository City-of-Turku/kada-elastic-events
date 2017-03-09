import * as ReactDOM from "react-dom";
import * as React from "react";
import { KadaSearch } from "./kadasearch/kadasearch.tsx";
import DrupalSettings from "./DrupalSettings.tsx";
import { Router, Route, IndexRoute } from "react-router";
const createBrowserHistory = require("history/lib/createBrowserHistory")

let rootElemId = "kada-event-search";

if (DrupalSettings.settings.noDrupal) {
  rootElemId = "root";
}

ReactDOM.render((
  <Router history={createBrowserHistory()}>
    <Route component={KadaSearch} path="/"/>
    <Route component={KadaSearch} path="*"/>
    <Route component={KadaSearch} path="kadasearch"/>
  </Router>
), document.getElementById(rootElemId));
