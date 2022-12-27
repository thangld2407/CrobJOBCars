require("dotenv").config();
const cron = require("node-cron");
const scrapDautomall = require("./scraper/page_dautomall");

scrapDautomall();

cron.schedule("0 */10 * * *", async () => {
  scrapDautomall();
});
