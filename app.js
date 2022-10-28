require("dotenv").config();
const cron = require("node-cron");

function CrawlData() {
  const browserObject = require("./browser");
  const scraperController = require("./controller/pageController");

  //Start the browser and create a browser instance
  let browserInstance = browserObject.startBrowser();

  // Pass the browser instance to the scraper controller
  scraperController(browserInstance);
}

CrawlData();

cron.schedule("0 0 * * *", async () => {
  CrawlData();
});
