/* tslint:disable:quotemark */
import { extend } from 'lodash'

// Exclude Drupal-object so the build does not crash but we can still use it
// when available.
declare var Drupal: any;
declare var window;
let DrupalSettings: any;

// from Drupal.
let checkPlain = (str) => {
  let character, regex,
      replace = { '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' };
  str = String(str);
  for (character in replace) {
    if (replace.hasOwnProperty(character)) {
      regex = new RegExp(character, 'g');
      str = str.replace(regex, replace[character]);
    }
  }
  return str;
};

// If developing or deploying the app separately from Drupal, the
// Drupal object needs to be shimmed.
if (typeof Drupal === "undefined") {
  DrupalSettings = {
    settings: extend({
      noDrupal: 'true',
      language: 'fi',
//      currentCalendar: 'hobbies',
      currentCalendar: 'events',
    }, require("../kada-config.js"))
  }
  window["Drupal"] = DrupalSettings;
  // Shim for the t() function so things can be translated in Drupal.
  window["Drupal"]["t"] = (str, args) => {
    if (args) {
      for (let key in args) {
        switch (key.charAt(0)) {
          // Escaped only.
          case '@':
            args[key] = checkPlain(args[key]);
          break;
          // Pass-through.
          case '!':
            break;
          // Escaped and placeholder.
          case '%':
          default:
            args[key] = "[" + args[key] + "]";
            break;
        }
        str = str.replace(key, args[key]);
      }
    }
    return str;
  };
} else {
  DrupalSettings = Drupal;
}

export default DrupalSettings;
