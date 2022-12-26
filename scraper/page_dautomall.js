require("dotenv").config();
const fs = require("fs");
const { startBrowser } = require("../browser");

function sleep(seconds) {
  return new Promise((resolve, reject) => setTimeout(resolve, seconds));
}

async function detailCars(car_code, page) {
  try {
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(`${url}/BuyCar/BuyCarView.do?sCarProductCode=${car_code}`, {
      waitUntil: "domcontentloaded",
    });

    const listImage = await page.evaluate(() => {
      let lists = [];
      const ellistImage = document.querySelectorAll(".slide.slick-slide");
      ellistImage.forEach((elImage) => {
        let src = elImage.getAttribute("style").trim();
        src = src.replace("background-image: url(", "");
        src = src.replace(`)`, "");
        src = src.replace(`'`, "");
        src = src.split(";")[0];
        src = src.replace(`'`, "");
        lists.push(src);
      });
      return lists;
    });
    const car_name = await page.evaluate(() => {
      let name = document.querySelector(".infoWp .secTop h3").innerText;
      return name;
    });

    const price = await page.evaluate(() => {
      let _price = document.querySelector(".infoWp .price h1").innerText;
      return Number(_price.replace(/[^0-9]/g, "")) || 0;
    });

    const basic_infr = await page.evaluate(() => {
      let obj = {};
      let elBasicInfr = document.querySelector("#basic_infr .tb02");
      let year_manufacture = elBasicInfr.querySelector(
        "tr:nth-child(1) td:nth-child(2)"
      ).innerText;
      let color = elBasicInfr.querySelector(
        "tr:nth-child(1) td:nth-child(4)"
      ).innerText;
      let fuel_type = elBasicInfr.querySelector(
        "tr:nth-child(2) td:nth-child(2)"
      ).innerText;
      let distance_driven = elBasicInfr.querySelector(
        "tr:nth-child(2) td:nth-child(4)"
      ).innerText;
      let plate_number = elBasicInfr.querySelector(
        "tr:nth-child(3) td:nth-child(2)"
      ).innerText;
      let transmission = elBasicInfr.querySelector(
        "tr:nth-child(3) td:nth-child(4)"
      ).innerText;
      let presentation_number = elBasicInfr.querySelector(
        "tr:nth-child(4) td:nth-child(2)"
      ).innerText;
      obj = {
        ...obj,
        year_manufacture:
          Number(year_manufacture.replace(/[^0-9]/g, "").slice(0, 4)) || 0,
        color,
        fuel_type,
        distance_driven: Number(distance_driven.replace(/[^0-9]/g, "")) || 0,
        plate_number,
        transmission,
        presentation_number,
      };

      return obj;
    });

    const convenience_infr = await page.evaluate(() => {
      let listConvenience = [];
      let elBasicInfr = document.querySelector("#BuyCarPopup_Option");
      elBasicInfr.style.display = "block";
      let elTr = elBasicInfr.querySelectorAll(".tb03 tr");
      elTr.forEach((el) => {
        let elTd = el.querySelectorAll("td");
        elTd.forEach((_el_td) => {
          let text = _el_td.innerText.trim();
          if (text) {
            listConvenience.push(text);
          }
        });
      });

      return listConvenience;
    });

    const car_model = await page.evaluate(() => {
      let carModelEl = document.querySelector(".wd50p.price_wp h5").innerText;
      return carModelEl || "";
    });

    await page.addStyleTag({
      content: `#BuyCarPopup_Inspect { display: none !important; }`,
    });

    const frame = await page.$("#checkReport_wp_iframe");
    const frameContent = await frame.contentFrame();
  

    const performance_check_link = await frameContent.evaluate(() => {
      let link = document.querySelector(".btn_checkReportMore").getAttribute("onclick");
      return link;
    });
    await page.close();
    return {
      car_code,
      frameContent,
      // car_model,
      // listImage,
      // car_name,
      // price,
      // basic_infr,
      // convenience_infr,
    };
  } catch (error) {
    console.log("Lỗi ", error);
  }
}

const url = "https://dautomall.com";

async function scrapDautomall() {
  console.time("CRAWL DATA");

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
    console.log(`| SETUP CRAWL DATA WEBSITE - ${url}`);

    await page.goto(`${url}/BuyCar/BuyCarDomesticList.do`);
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
      const carList = await frame.evaluate(async () => {
        console.log("Car LIST RUN");
        const elCarList = document.querySelectorAll(
          ".secMdle .tb01 tr:not(:first-child)"
        );
        const list = [];

        elCarList.forEach((car) => {
          console.log("CAR: ", car);

          const car_code = car.getAttribute("onclick");
          console.log("vào đây", car_code);
          console.log("qua chi tiết");

          const reGetCode = /(?<=\().+?(?=\))/;
          let _car_code = car_code.match(reGetCode);
          _car_code = _car_code[0].split("'");

          if (Array.isArray(_car_code)) {
            if (_car_code.length >= 2) {
              _car_code = _car_code[1];
            }
          }

          list.push(_car_code);
        });
        return list;
      });

      for (let i = 0; i < carList.length; i++) {
        const car = carList[i];
        let pageDetail = await browser.newPage();
        const detail = await detailCars(car, pageDetail);
        console.log("DETAIL: ", detail);
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
    await browser.close();
    console.timeEnd("CRAWL DATA");
  } catch (error) {
    console.log("Lỗi ", error);
  }
}

module.exports = scrapDautomall;
