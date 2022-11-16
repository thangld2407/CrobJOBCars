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

      console.log(
        `Đang chuyển hướng đến trang ${this.url}/BuyCar/BuyCarDomesticList.do...`
      );

      await page.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);

      console.log("Đang chờ 5 giây để tải trang...");

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

      console.log(`Tổng số trang: ${totalPage}`);

      await frame.waitForSelector(".form1 .secMdle");

      await frame.waitForSelector(".form1 .tb01");

      await frame.waitForSelector(".form1 .secMdle .pagination a");

      console.log("Đang lấy danh sách xe...");

      const dataFile = [];

      for (let i = 1; i <= 1; i++) {
        console.log("Lấy số trang có trong phạm vi: ", i);

        const numberPaginationInPage = await frame.evaluate(() => {
          let paginate = document.querySelectorAll(
            ".secMdle .pagination a"
          ).length;

          return paginate;
        });

        console.log("Đã lấy được số trang phạm vi", numberPaginationInPage);

        for (let j = 3; j <= numberPaginationInPage - 1; j++) {
          console.log("Chuyển đến trang: ", j - 1);

          await sleep(5000);

          // await frame.evaluate((j) => {
          //   document
          //     .querySelector(`.secMdle .pagination a:nth-child(${5})`)
          //     .click();
          // });

          await frame.waitForSelector(".secMdle .pagination a");

          console.log(`Đang lấy danh sách xe trang ${j - 1}...`);

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

          console.log(`Đã lấy được ${carList.length} xe từ trang ${i}`);

          dataFile.push(...carList);

          await frame.click(`.secMdle .pagination a:nth-child(${j - 1})`, {});

          await sleep(5000);
        }

        console.log("Đã lấy được tất cả xe từ trang", i);

        await frame.waitForSelector(".tb01");
      }

      console.log("Đã lấy được danh sách xe");

      console.log("Đang lưu danh sách xe vào file...");

      fs.writeFileSync("dautomall.json", JSON.stringify(dataFile));
    } catch (error) {
      console.log("Lỗi ", error);
      // this.scraper(browser);
    }
  },
};

module.exports = scraperObject;
