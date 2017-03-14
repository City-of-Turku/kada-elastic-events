React Searchkit based search developed as open source project for city of Turku and later for wider use. It is intented to be used as event calendar search and will be integrated to Drupal.

Installation:

- Install Node.js / NPM 3.x or newer with your preferred package manager or with the official binaries (https://nodejs.org/en/download/).
- Install TSD(Yes, it's deprecated. Will be fixed later.):
	- `npm install tsd -g`
- `tsd install`
- `npm install`
- `cp kada-config.example.js kada-config.js`
  - Edit the kada-config.js file, enter your Elasticsearch server url(and port if necessary)
- `npm start`
- visit http://localhost:3000 (This is current default, will change later).

Also installation of Elastic Search 2.x(for now, later 5.x) is recommended if using the Kadasearch-Drupal module for indexing(not published yet).

## Packing a new dist

- Make sure you have run `npm install` so webpack is installed and `npm run build`
