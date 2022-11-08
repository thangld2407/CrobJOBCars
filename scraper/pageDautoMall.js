require("dotenv").config();
const fs = require("fs");

const scraperObject = {
  url: "https://dautomall.com",
  async scraper(browser) {
    try {
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

      // for (let i = 1; i <= totalPage; i++) {
      let page = await browser.newPage();
      console.log(`Navigating to ${this.url}/BuyCar/BuyCarDomesticList.do ...`);
      await page.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);
      const frame = page
        .frames()
        .find((frame) => frame.name() === "body_IFrame");

      await frame.waitForSelector(".form1");

      let data = await frame.evaluate(() => {
        let data = [];
        let elements = document.querySelectorAll(".tb01 tbody tr");

        for (let el of elements) {
          // let obj = {};
          let photo = el && el.querySelector(".TDmodel .photo");
          if (photo) {
            data.push(photo.querySelector("img").src);
          }
        }

        return data;
      });

      dataFile.push(data);
      console.log(dataFile);
      // }

      await browser.close();
    } catch (error) {
      // this.scraper(browser);
      console.log(error);
    }
  },
};

module.exports = scraperObject;
