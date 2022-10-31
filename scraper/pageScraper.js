require("dotenv").config();
const fs = require("fs");

const scraperObject = {
  url: "https://www.djauto.co.kr/car/carList.html",
  async scraper(browser) {
    let dataFile = [];
    let category;
    let pageTemp = await browser.newPage();
    await pageTemp.goto(this.url);
    await pageTemp.waitForSelector(".car_list tbody");

    let totalPage = await pageTemp.evaluate(() => {
      let lastPage = document.querySelector("#paging a:last-child");
      return lastPage
        .getAttribute("href")
        .split("?")[1]
        .split("&")[0]
        .split("=")[1];
    });

    for (let i = 1; i <= totalPage; i++) {
      let page = await browser.newPage();
      console.log(`Navigating to ${this.url}?cho=1&page=${i}...`);

      await page.goto(`${this.url}?cho=1&page=${i}`);

      await page.waitForSelector(".car_list");

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
          data.push(item.textContent.trim().split("[")[1].split("]")[0].trim());
        });
        return data;
      });

      let pagePromise = (link) =>
        new Promise(async (resolve, reject) => {
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
            detail_interior[0].querySelectorAll("label").forEach((item) => {
              exterior.push(item.textContent);
            });

            let guts = [];
            detail_interior[1].querySelectorAll("label").forEach((item) => {
              guts.push(item.textContent);
            });

            let safety = [];
            detail_interior[2].querySelectorAll("label").forEach((item) => {
              safety.push(item.textContent);
            });

            let convenience = [];

            detail_interior[3].querySelectorAll("label").forEach((item) => {
              convenience.push(item.textContent);
            });

            let vehicle_detail = {
              exterior,
              guts,
              safety,
              convenience,
            };

            let s_carCode = "";
            let urlDirect = window.location.search;
            if (urlDirect) {
              s_carCode = urlDirect.split("&")[0].split("=")[1];
            }

            let phone_contact = document
              .querySelector(".detail_info2 tr:nth-child(1) td .txt_phone")
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
                price: `${price} ${curreny_unit}`,
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
              },
              seller,
              vehicle_detail,
              performance_check,
            };
          });

          resolve(dataObj);
          await newPage.close();
        });

      for (let i = 0; i <= carListPage.length; i++) {
        if (carListPage[i] !== undefined) {
          let currentDetails = await pagePromise(
            `https://www.djauto.co.kr${carListPage[i]}`
          );

          dataFile.push(currentDetails);
          const axios = require("axios");
          try {
            await axios.post(`${process.env.BASE_URL}/api/cars/save`, {
              data: currentDetails,
            });
          } catch (error) {
            console.log(error);
          }
        }
      }
      category = listTypeCar.filter((item, index) => {
        return listTypeCar.indexOf(item) === index;
      });

      for (let i = 0; i < category.length; i++) {
        const axios = require("axios");
        try {
          await axios.post(`${process.env.BASE_URL}/api/cars/save-type`, {
            car_type_name: category[i],
          });
        } catch (error) {
          console.log(error);
        }
      }

      await page.close();
    }
    fs.writeFileSync("type.json", JSON.stringify(category));

    fs.writeFileSync("data.json", JSON.stringify(dataFile));

    console.log("Done crawling");

    // Remove duplicate item in array

    await pageTemp.close();
    await browser.close();
  },
};

module.exports = scraperObject;
