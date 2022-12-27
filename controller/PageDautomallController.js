const { startBrowser } = require("../browser");
const fs = require("fs");
const URL_CRAWL = "https://dautomall.com";
async function PageDauto(count = 0) {
  const browser = await startBrowser();
  try {
    let page = await browser.newPage();

    await page.setViewport({
      width: 1200,
      height: 800,
    });

    console.log(
      "============================================================================"
    );
    console.log(`| SETUP CRAWL DATA WEBSITE - ${URL_CRAWL}`);

    await page.goto(`${URL_CRAWL}/BuyCar/BuyCarDomesticList.do`);
    await sleep(5000);

    console.log(
      "============================================================================"
    );
    console.log("| START CRAWL DATA");

    await page.waitForSelector(".sch_result");

    const frame = await page.frames().find((f) => f.name() === "body_IFrame");

    await frame.waitForSelector(".form1 .secMdle");
    await frame.waitForSelector(".form1 .secMdle .pagination");

    // const totalPage = await frame.evaluate(() => {
    //   const lastPage = document
    //     .querySelector(".pagination .NextNext")
    //     .getAttribute("onclick");
    //   return lastPage.match(/\d+/)[0];
    // });
    const totalPage = 2;

    await sleep(1000);
    console.log(
      "============================================================================"
    );
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

      console.log(
        "============================================================================"
      );
      console.log(
        `| CURRENT PAGE: [ ${pageNumber} ] - INDEX PAGINATION [ ${positionClick[position]} ]`
      );

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
            sCarProductCode: car_code.match(/[A-Z][0-9]\d+/g)[0],
          };
          list.push(carInfo);
        });
        return list;
      });

      for (let i = 0; i < carList.length; i++) {
        const name = await PageDetail(browser, carList[i].sCarProductCode);
        console.log(name);
      }

      dataFile = [...dataFile, ...carList];

      position = position + 1;

      if (position > 0 && pageNumber < totalPage) {
        let TEXT = "";

        if (position === 0) {
          TEXT = "0";
        } else if (position === 10) {
          TEXT = "NEXT";
        } else {
          TEXT = `${position + 1}`;
        }

        console.log(
          "============================================================================"
        );
        console.log(`| CLICK PAGE: [ ${TEXT} ]`);
        await frame.click(
          `.secMdle .pagination a:nth-child(${positionClick[position]})`,
          {}
        );
      }

      await sleep(5000);

      pageNumber++;
    }

    console.log(
      "============================================================================"
    );
    console.log("| STOP CRAWL DATA");

    console.log("Đang lưu danh sách xe vào file...");

    fs.writeFileSync("dautomall.json", JSON.stringify(dataFile));

    console.log("Đã lưu danh sách xe vào file");

    await page.close();
  } catch (error) {
    console.log(error);
    console.log("Navigate to page error: ", count);
    PageDauto(count);
  }
}

function sleep(seconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds));
}
// Path: controller\index.js
module.exports = PageDauto;

async function PageDetail(browser, link) {
  try {
    let page = await browser.newPage();
    await page.goto(
      `${URL_CRAWL}/BuyCar/BuyCarView.do?sCarProductCode=${link}`
    );

    await sleep(5000);

    await page.waitForSelector(".sellcarBox");

    await page.waitForSelector(".basic_infr");

    let carFound = await page.evaluate(() => {
      let car_name = document.querySelector(".infoWp .secTop h3").innerText;
      let year_manufacture = document.querySelector(".basic_infr .tb02 ")
      return {

      }
    });
    fs.writeFileSync("dautomallName.json", JSON.stringify(car_name));

    await page.close();
    return Promise.resolve(carFound);
  } catch (error) {
    return Promise.reject(error);
  }
}
