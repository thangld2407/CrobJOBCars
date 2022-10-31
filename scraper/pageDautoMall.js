require("dotenv").config();
const fs = require("fs");

const scraperObject = {
  url: "https://dautomall.com",
  async scraper(browser) {
    let dataFile = [];
    let pageTemp = await browser.newPage();
    console.log(`Navigating to ${this.url}/BuyCar/BuyCarDomesticList.do ...`);
    await pageTemp.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);
    await pageTemp.waitForSelector("#body_IFrame");

    let totalPage = await pageTemp.evaluate(() => {
      let lastPage = document
        .querySelector(".NextNext")
        .getAttribute("onclick")
        .split("(")[1]
        .split(")")[0]
        .trim();
      return lastPage;
    });

    for (let i = 1; i <= totalPage; i++) {
      
    }

    // await pageTemp.close();
  },
};

module.exports = scraperObject;
