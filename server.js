require("dotenv").config();
const cron = require("node-cron");
const PageDjautoController = require("./controller/PageDjautoController");

CrawlData()

cron.schedule("0 */8 * * *", async () => {
  CrawlData();
});

function CrawlData() {
  PageDjautoController();
}
