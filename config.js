/* ---------------------------------------------------------------------
   UoR Attendance — connection settings
   Edit ONLY this file after deploying the Apps Script web app.

   API_URL : the /exec address of your deployment.
   APP_KEY : must match APP_KEY in Code.gs exactly. Change both together.

   Note: a browser has to know where to send its requests, so neither of
   these can be kept secret from someone who opens the page source. What
   protects the data is that every action requires a valid teacher or
   administrator code, and repeated wrong codes lock the endpoint.
   --------------------------------------------------------------------- */

window.UOR_CONFIG = {
  API_URL: 'https://script.google.com/macros/s/AKfycbzdex_ZHHoCVnYsbV9EpHygZb9S13LcpHb5nXo0sKO6Yw-6LbgUrsGRemeTMfoQZeSp/exec',
  APP_KEY: 'uor-bio-2026-CHANGE-THIS'
};
