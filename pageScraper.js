// https://viblo.asia/p/crawl-website-su-dung-nodejs-va-puppeteer-phan-1-L4x5xv2wZBM
const fs = require("fs");

const scraperObject = {
  url: "https://www.djauto.co.kr/car/carList.html",
  async scraper(browser) {
    let dataFile = [];
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
      // Navigate to the selected page
      await page.goto(`${this.url}?cho=1&page=${i}`);
      // Wait for the required DOM to be rendered
      await page.waitForSelector(".car_list");
      // Get the link to all the required books
      let carListPage = await page.evaluate((resultsSelector) => {
        let data = [];
        document.querySelectorAll(".year").forEach((item, index) => {
          data.push({
            model_year: item.innerText,
          });
        });
        document.querySelectorAll("td a.subject").forEach((item, index) => {
          data[index].car_name = item.innerText;
          data[index].href = item.getAttribute("href");
        });
        document
          .querySelectorAll("td.money b:first-child")
          .forEach((item, index) => {
            data[index].price = item.innerText;
          });
        document.querySelectorAll("td.photo a img").forEach((item, index) => {
          data[index].image_url = item.src;
        });

        return data;
      });
      dataFile = [...dataFile, ...carListPage];
      await page.close();
    }

    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();

        console.log(`Navigating to ${link}...`);
        await newPage.goto(link);

        await newPage.waitForSelector(".detail_wrap");

        dataObj["image"] = await newPage.evaluate(() => {
          let image = document.querySelectorAll(".photo_gallery li");
          let imageList = [];
          image.forEach((item) => {
            let new_url;
            let url = new URL(item.querySelector("a img").src);
            if (url.search !== "") {
              new_url = url.search.split("=")[1];
            } else {
              new_url = url.href;
            }
            imageList.push(new_url);
          });
          return imageList;
        });
        resolve(dataObj);
        await newPage.close();
      });

    for (let i = 0; i < dataFile.length; i++) {
      let currentPageData = await pagePromise(
        `https://www.djauto.co.kr${dataFile[i].href}`
      );
      dataFile[i].image = currentPageData.image;
    }

    console.log("Done crawling");

    await pageTemp.close();

    fs.writeFile("data.json", JSON.stringify(dataFile), (err) => {
      if (err) {
        console.log(err);
      }
    });
  },
};

module.exports = scraperObject;
