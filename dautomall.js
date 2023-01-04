require("dotenv").config();
const cron = require("node-cron");
const scrapDautomall = require("./scraper/page_dautomall");
const CRON_SCHEDULE = process.env.CRON_SCHEDULE_DAUTOMALL || "0 4 * * *";

cron.schedule(CRON_SCHEDULE, async () => {
  scrapDautomall();
});

scrapDautomall();
