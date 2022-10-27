// https://viblo.asia/p/crawl-website-su-dung-nodejs-va-puppeteer-phan-1-L4x5xv2wZBM
const fs = require("fs");

const scraperObject = {
  url: "https://www.djauto.co.kr/car/carList.html?cho=1",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector(".car_list");
    // Get the link to all the required books
    let urls = await page.evaluate((resultsSelector) => {
      let data = [];
      document.querySelectorAll(".year").forEach((item, index) => {
        data.push({
          model_year: item.innerText,
        });
      });
      document.querySelectorAll("td a.subject").forEach((item, index) => {
        data[index].car_name = item.innerText;
      });
      document
        .querySelectorAll("td.money b:first-child")
        .forEach((item, index) => {
          data[index].price = item.innerText;
        });
      document.querySelectorAll("td.photo a img").forEach((item, index) => {
        data[index].image_url = item.src;
      });
      return data;
    });
    fs.writeFile("data.json", JSON.stringify(urls), (err) => {
      if (err) {
        console.log(err);
      }
    });
  },
};

module.exports = scraperObject;
