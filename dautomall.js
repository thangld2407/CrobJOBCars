require("dotenv").config();
const cron = require("node-cron");
const scrapDautomall = require("./scraper/page_dautomall");

cron.schedule("0 4 * * *", async () => {
  scrapDautomall();
});
