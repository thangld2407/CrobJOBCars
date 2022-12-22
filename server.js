require("dotenv").config();
const cron = require("node-cron");
const PageDjautoController = require("./controller/PageDjautoController");
const PageDauto = require("./controller/PageDautomallController");

// cron.schedule("0 */8 * * *", async () => {
//   await CrawlDautomallData();
//   await CrawlData();
// });

async function CrawlData() {
  await PageDjautoController();
}

async function CrawlDautomallData() {
  await PageDauto();
}

async function RunCrawl() {
  await CrawlDautomallData();
  // await CrawlData();
}

RunCrawl();