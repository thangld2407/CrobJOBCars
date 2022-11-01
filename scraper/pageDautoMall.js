require("dotenv").config();
const fs = require("fs");

const scraperObject = {
  url: "https://dautomall.com",
  async scraper(browser) {
    let dataFile = [];
    let pageTemp = await browser.newPage();

    console.log(`Navigating to ${this.url}/BuyCar/BuyCarDomesticBody.do ...`);

    await pageTemp.goto(`${this.url}/BuyCar/BuyCarDomesticBody.do`);

    await pageTemp.waitForSelector(".secMdle");

    let totalPage = await pageTemp.evaluate(() => {
      let lastPage = document
        .querySelector(".pageWp .pagination a.NextNext")
        .getAttribute("onclick")
        .trim()
        .split("(")[1]
        .split(")")[0]
        .trim();
      return lastPage;
    });

    console.log("Closing the pageTemp...");
    await pageTemp.close();
    console.log(`Total page: ${totalPage}`);

    // for (let i = 1; i <= totalPage; i++) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}/BuyCar/BuyCarDomesticList.do ...`);
    await page.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);
    const frame = page.frames().find((frame) => frame.name() === "body_IFrame");
    await frame.waitForSelector(".form1");
    const text = await frame.$eval(
      ".tb01 tbody tr",
      (element) => element.innerHTML
    );
    console.log(text);
    // }

    // console.log(totalPage);
    await browser.close();
  },
};

module.exports = scraperObject;
