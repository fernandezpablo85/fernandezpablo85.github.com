function _track (name, category) {
  if(typeof _gaq == "undefined") throw "tracking script depends on google analytics.";
  _gaq.push(['_trackEvent', 'Navigation', name, category]);
}