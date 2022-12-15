require("dotenv").config();
const fs = require("fs");
const { delay } = require("lodash");

function sleep(seconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds));
}

const scraperObject = {
  url: "https://dautomall.com",
  regexCarCode: /[A-Z][0-9]\d+/g,
  async scraper(browser) {
    try {
      let page = await browser.newPage();

      await page.setViewport({
        width: 1200,
        height: 800,
      });

      console.log('============================================================================');
      console.log(`| SETUP CRAWL DATA WEBSITE - ${this.url}`);

      await page.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);
      await sleep(5000);

      console.log('============================================================================');
      console.log('| START CRAWL DATA');

      await page.waitForSelector(".sch_result");

      const frame = await page.frames().find((f) => f.name() === "body_IFrame");

      await frame.waitForSelector(".form1 .secMdle");
      await frame.waitForSelector(".form1 .secMdle .pagination");

      const totalPage = await frame.evaluate(() => {
        const lastPage = document
          .querySelector(".pagination .NextNext")
          .getAttribute("onclick");
        return lastPage.match(/\d+/)[0];
      });

      await sleep(1000);
      console.log('============================================================================');
      console.log(`| TOTAL PAGE: ${totalPage}`);
      await sleep(1000);

      await frame.waitForSelector(".form1 .secMdle");

      await frame.waitForSelector(".form1 .tb01");

      await frame.waitForSelector(".form1 .secMdle .pagination a");

      let dataFile = [];

      let pageNumber = 1;

      const positionClick = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
      let position = 0;

      while (pageNumber <= totalPage) {
        if (position >= 10) {
          position = 0;
        }

        console.log('============================================================================');
        console.log(`| CURRENT PAGE: [ ${pageNumber} ] - INDEX PAGINATION [ ${positionClick[position]} ]`);
        
        await sleep(5000);
        await frame.waitForSelector(".secMdle .pagination a");
        await frame.waitForSelector(".form1 .tb01");
        const carList = await frame.evaluate(() => {
          const carList = document.querySelectorAll(
            ".secMdle .tb01 tr:not(:first-child)"
          );
          const list = [];
          carList.forEach((car) => {
            const car_code = car.getAttribute("onclick");

            const carInfo = {
              sCarProductCode: car_code,
            };
            list.push(carInfo);
          });
          return list;
        });

        dataFile = [...dataFile, ...carList];

        position = position + 1;

        if (position > 0  && pageNumber < totalPage) {
          let TEXT = '';

          if (position === 0) {
            TEXT = '0';
          } else if (position === 10) {
            TEXT = 'NEXT';
          } else {
            TEXT = `${position + 1}`;
          }

          console.log('============================================================================');
          console.log(`| CLICK PAGE: [ ${TEXT} ]`);
          await frame.click(`.secMdle .pagination a:nth-child(${positionClick[position]})`, {});
        }

        await sleep(5000);        

        pageNumber++;
      }

      console.log('============================================================================');
      console.log('| STOP CRAWL DATA');

      console.log("Đang lưu danh sách xe vào file...");

      fs.writeFileSync("dautomall.json", JSON.stringify(dataFile));

      console.log("Đã lưu danh sách xe vào file");

      await page.close();
    } catch (error) {
      console.log("Lỗi ", error);
      // this.scraper(browser);
    }
  },
};

module.exports = scraperObject;
