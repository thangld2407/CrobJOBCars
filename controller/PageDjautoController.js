const axios = require("axios");
const fs = require("fs");
const { startBrowser } = require("../browser");
const convertNameToModel = require("../helper/convertNameToModel");

const URL_CRAWL = "https://www.djauto.co.kr/car/carList.html";

async function PageDjautoController(count = 0) {
  let browser = await startBrowser();
  try {
    let dataFile = [];
    let pageTemp = await browser.newPage();
    console.log(`===== Đang vào trang ${URL_CRAWL} =====`);

    for (let n = 1; n <= 2; n++) {
      console.log("===== Đang vào trang xe theo loại xe =====");
      await pageTemp.goto(`${URL_CRAWL}?cho=${n}`);

      console.log(`=== Vào trang xe loại ${n} thành công ===`);

      await pageTemp.waitForSelector(".car_list tbody");

      console.log(`=== Đang lấy tổng số trang của trang xe loại ${n} ===`);

      let totalPage = await pageTemp.evaluate(() => {
        let lastPage = document.querySelector("#paging a:last-child");
        return lastPage
          .getAttribute("href")
          .split("?")[1]
          .split("&")[0]
          .split("=")[1];
      });

      console.log(
        `=== Tổng số trang của trang xe loại ${n} là ${totalPage} ===`
      );

      for (let i = count || 1; i <= totalPage; i++) {
        let page = await browser.newPage();
        console.log(`===== Đang vào trang ${i} của trang xe loại ${n} =====`);

        await page.goto(`${URL_CRAWL}?cho=${n}&page=${i}`);

        console.log(`=== Vào trang ${i} của trang xe loại ${n} thành công ===`);

        await page.waitForSelector(".car_list tbody");

        console.log(
          `=== Đang lấy danh sách xe của trang ${i} của trang xe loại ${n} ===`
        );

        let carListPage = await page.evaluate(() => {
          let data = [];
          document.querySelectorAll("td a.subject").forEach((item, index) => {
            data.push(item.getAttribute("href"));
          });
          return data;
        });

        console.log(
          `=== Lấy danh sách xe của trang ${i} của trang xe loại ${n} thành công ===`
        );

        for (let j = 0; j <= carListPage.length; j++) {
          if (carListPage[j] !== undefined) {
            console.log("===== Đang lấy chi tiết của xe: ", carListPage[j]);
            let currentDetails = await pagePromise(
              browser,
              `https://www.djauto.co.kr${carListPage[j]}`
            );

            console.log("===== Lấy thành công chi tiết xe: ", carListPage[j]);

            dataFile.push(currentDetails);
            try {
              console.log(
                "===== Lưu dữ liệu xe: ",
                carListPage[j],
                "Vào database ====="
              );
              const response = await axios.post(
                `${process.env.BASE_URL}/api/cars/save`,
                {
                  data: currentDetails,
                }
              );
              console.log(response.data.message);
            } catch (error) {
              console.log("Lỗi khi lưu dữ liệu xe ", count);
              console.log(error.data.message);
              PageDjautoController(count);
            }
          }
        }

        await page.close();
      }
    }

    console.log("=================== Hoàn tất lấy dữ liệu ============");
    fs.writeFileSync("data.json", JSON.stringify(dataFile));
    await pageTemp.close();
    await browser.close();
  } catch (error) {
    console.log(error);
    console.log("Navigate to page error: ", count);
    PageDjautoController(count);
  }
}

async function pagePromise(browser, link) {
  try {
    let dataObj = {};
    let newPage = await browser.newPage();

    console.log(`===== Đang vào trang chi tiết của xe =====`);

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
        document.querySelector(".text_subject").textContent.trim();
      let category = car_name.split(" ")[0].trim();

      let price =
        (document.querySelector(".detail_wrap td .txt_price") &&
          document.querySelector(".detail_wrap td .txt_price").textContent) ||
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
        year_manufacture = `20${year_manufacture.split("/")[0].trim()}`.trim();
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

      let detail_interior = document.querySelectorAll(".detail_interior dl");
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
        performance_check,
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

      console.log(`===== Đã lây thành công chi tiết của xe  =====`);

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
        source_crawl: "https://www.djauto.co.kr",
      };
    });
    return {
      ...dataObj,
      basic_infor: {
        ...dataObj.basic_infor,
        car: convertNameToModel(dataObj.basic_infor.car_name),
      },
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}
module.exports = PageDjautoController;
