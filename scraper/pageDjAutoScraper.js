require("dotenv").config();
const fs = require("fs");
const scraperObject = {
  url: "https://www.djauto.co.kr/car/carList.html",
  count: 0,
  countCho: 1,
  async scraper(browser, count) {
    try {
      let dataFile = [];
      let category;
      let pageTemp = await browser.newPage();
      console.log(`Navigating to  ${this.url}...`);

      for (let n = 1; n <= 2; n++) {
        this.countCho = n;

        await pageTemp.goto(`${this.url}?cho=${this.countCho}`);

        await pageTemp.waitForSelector(".car_list tbody");

        let totalPage = await pageTemp.evaluate(() => {
          let lastPage = document.querySelector("#paging a:last-child");
          return lastPage
            .getAttribute("href")
            .split("?")[1]
            .split("&")[0]
            .split("=")[1];
        });

        for (let i = this.count === 0 ? 1 : this.count; i <= 3; i++) {
          this.count = i;
          let page = await browser.newPage();
          console.log(`Navigating to ${this.url}?cho=${n}&page=${i}...`);

          await page.goto(`${this.url}?cho=${n}&page=${i}`);

          await page.waitForSelector(".car_list tbody");

          let carListPage = await page.evaluate(() => {
            let data = [];
            document.querySelectorAll("td a.subject").forEach((item, index) => {
              data.push(item.getAttribute("href"));
            });
            return data;
          });

          let listTypeCar = await page.evaluate(() => {
            let data = [];
            document.querySelectorAll("td a.subject").forEach((item, index) => {
              data.push(
                item.textContent.trim().split("[")[1].split("]")[0].trim()
              );
            });
            return data;
          });

          // category = listTypeCar.filter((item, index) => {
          //   return listTypeCar.indexOf(item) === index;
          // });

          // for (let i = 0; i < category.length; i++) {
          //   const axios = require("axios");
          //   try {
          //     await axios.post(`${process.env.BASE_URL}/api/category/save`, {
          //       category_name: category[i],
          //     });
          //   } catch (error) {
          //     console.log(error);
          //   }
          // }

          let pagePromise = (link) =>
            new Promise(async (resolve, reject) => {
              try {
                let dataObj = {};
                let newPage = await browser.newPage();

                console.log(`Navigating to ${link}...`);
                await newPage.goto(link);

                await newPage.waitForSelector(".detail_wrap");

                dataObj = await newPage.evaluate(() => {
                  let image = document.querySelectorAll(".photo_gallery li");
                  let imageList = [];
                  image.forEach((item) => {
                    let new_url;
                    let url =
                      (item.querySelector("a img") &&
                        new URL(item.querySelector("a img").src)) ||
                      "";
                    if (url.search !== "") {
                      new_url = url.search.split("=")[1];
                    } else {
                      new_url = url.href;
                    }
                    imageList.push(new_url);
                  });

                  let car_name =
                    document.querySelector(".text_subject") &&
                    document.querySelector(".text_subject").textContent;
                  let category = car_name.split(" ")[0].trim();

                  let price =
                    (document.querySelector(".detail_wrap td .txt_price") &&
                      document.querySelector(".detail_wrap td .txt_price")
                        .textContent) ||
                    "";
                  let curreny_unit =
                    (document.querySelector(".first strong") &&
                      document.querySelector(".first strong").textContent) ||
                    "";

                  let license_plate =
                    document.querySelector(
                      ".detail_info1 tbody tr:nth-child(2) td:nth-child(2)"
                    ) &&
                    document.querySelector(
                      ".detail_info1 tbody tr:nth-child(2) td:nth-child(2)"
                    ).textContent;

                  let year_manufacture =
                    document.querySelector(
                      ".detail_info1 tbody tr:nth-child(2) td:nth-child(4)"
                    ) &&
                    document.querySelector(
                      ".detail_info1 tbody tr:nth-child(2) td:nth-child(4)"
                    ).textContent;

                  if (year_manufacture.includes("/")) {
                    year_manufacture = `20${year_manufacture
                      .split("/")[0]
                      .trim()}`.trim();
                  }

                  let distance_driven = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(3) td:nth-child(2)"
                  ).textContent;

                  let fuel_type = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(3) td:nth-child(4)"
                  ).textContent;

                  let gearbox = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(4) td:nth-child(2)"
                  ).textContent;

                  let cylinder_capacity = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(4) td:nth-child(2)"
                  ).textContent;

                  let color = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(5) td:nth-child(2)"
                  ).textContent;

                  let car_type = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(5) td:nth-child(4)"
                  ).textContent;

                  let seizure = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(6) td:nth-child(2)"
                  ).textContent;

                  let mortgage = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(6) td:nth-child(4)"
                  ).textContent;

                  let presentation_number = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(7) td:nth-child(2)"
                  ).textContent;

                  let storage_location = document.querySelector(
                    ".detail_info1 tbody tr:nth-child(7) td:nth-child(4)"
                  ).textContent;

                  let performance_check = document
                    .querySelector(".detail_photo_wrap .detail_explain > a")
                    .getAttribute("href");

                  // lấy mã trong thẻ performance_check
                  let [a, b] = performance_check.split("(");
                  // xử lý chuỗi bỏ qua kí tự "("
                  let [c, d] = b.split(")");
                  // xử lý chuỗi bỏ qua kí tự ")", "c" là biến cuối cùng lấy được

                  performance_check = `https://www.djauto.co.kr/car/carViewFrameUsedCarCheck.html?checkFlag=${c}`;

                  let detail_interior = document.querySelectorAll(
                    ".detail_interior dl"
                  );
                  let exterior = [];
                  detail_interior[0]
                    .querySelectorAll("label")
                    .forEach((item) => {
                      exterior.push(item.textContent);
                    });

                  let guts = [];
                  detail_interior[1]
                    .querySelectorAll("label")
                    .forEach((item) => {
                      guts.push(item.textContent);
                    });

                  let safety = [];
                  detail_interior[2]
                    .querySelectorAll("label")
                    .forEach((item) => {
                      safety.push(item.textContent);
                    });

                  let convenience = [];

                  detail_interior[3]
                    .querySelectorAll("label")
                    .forEach((item) => {
                      convenience.push(item.textContent);
                    });

                  let vehicle_detail = {
                    exterior,
                    guts,
                    safety,
                    convenience,
                    performance_check,
                  };

                  let s_carCode = "";
                  let urlDirect = window.location.search;
                  if (urlDirect) {
                    s_carCode = urlDirect.split("&")[0].split("=")[1];
                  }

                  let phone_contact = document
                    .querySelector(
                      ".detail_info2 tr:nth-child(1) td .txt_phone"
                    )
                    .textContent.trim();
                  let seller_name = document
                    .querySelector(".detail_info2 tr:nth-child(2) td ")
                    .textContent.trim();
                  let employee_number = document
                    .querySelector(".detail_info2 tr:nth-child(3) td ")
                    .textContent.trim();
                  let affiliated_company = document
                    .querySelector(".detail_info2 tr:nth-child(4) td")
                    .textContent.trim();
                  let business_address = document
                    .querySelector(".detail_info2 tr:nth-child(5) td ")
                    .textContent.trim();
                  let parking_location = document
                    .querySelector(".detail_info2 tr:nth-child(6) td ")
                    .textContent.trim();

                  let seller = {
                    phone_contact,
                    seller_name,
                    employee_number,
                    affiliated_company,
                    business_address,
                    parking_location,
                  };

                  return {
                    basic_infor: {
                      list_image: imageList,
                      car_name,
                      price,
                      car_code: s_carCode,
                      license_plate,
                      year_manufacture,
                      distance_driven,
                      fuel_type,
                      gearbox,
                      cylinder_capacity,
                      color,
                      car_type,
                      seizure,
                      mortgage,
                      presentation_number,
                      storage_location,
                      category,
                      primary_image: imageList[0],
                    },
                    seller,
                    vehicle_detail,
                    is_hotsale: false,
                  };
                });
                resolve(dataObj);
                reject("error");
                await newPage.close();
              } catch (error) {
                reject(error);
              }
            });
          for (let j = 0; j <= carListPage.length; j++) {
            if (carListPage[j] !== undefined) {
              let currentDetails = await pagePromise(
                `https://www.djauto.co.kr${carListPage[j]}`
              );
              dataFile.push(currentDetails);
              const axios = require("axios");
              if (i <= 1) {
                try {
                  await axios.post(`${process.env.BASE_URL}/api/cars/save`, {
                    data: currentDetails,
                  });
                } catch (error) {
                  console.log(
                    "Navigate to page error catch save cars: ",
                    this.count
                  );
                  this.scraper(browser, this.count);
                }
              }
            }
          }

          await page.close();
        }

        this.count = 1;
      }
      fs.writeFileSync("type.json", JSON.stringify(category));

      fs.writeFileSync("data.json", JSON.stringify(dataFile));
      console.log("Done crawling");

      await pageTemp.close();
      await browser.close();
    } catch (error) {
      console.log("Navigate to page error: ", this.count);
      console.log(error);
      this.scraper(browser, this.count);
    }
  },
};

module.exports = scraperObject;
