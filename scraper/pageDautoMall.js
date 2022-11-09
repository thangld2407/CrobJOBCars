require("dotenv").config();
const fs = require("fs");

const scraperObject = {
  url: "https://dautomall.com",
  async scraper(browser) {
    try {
      let dataFile = [];
      let pageTemp = await browser.newPage();

      await pageTemp.setViewport({ width: 1500, height: 800 });

      console.log(`Navigating to ${this.url}/BuyCar/BuyCarDomesticBody.do ...`);
      await pageTemp.goto(`${this.url}/BuyCar/BuyCarDomesticList.do`);

      const frame = pageTemp
        .frames()
        .find((frame) => frame.name() === "body_IFrame");

      await frame.waitForSelector(".form1");

      await pageTemp.waitForSelector(".secMdle");

      let totalPage = await frame.evaluate(() => {
        let lastPage = document
          .querySelector(".pageWp .pagination a.NextNext")
          .getAttribute("onclick")
          .trim()
          .split("(")[1]
          .split(")")[0]
          .trim();
        return lastPage;
      });

      console.log("Đã lấy được tổng số trang là", totalPage);

      let page = 1;
      do {
        page++;
        console.log(page);
        // Lấy số pagination trong 1 trang
        let pagination = await frame.evaluate(() => {
          let pagination = document.querySelectorAll(".pageWp .pagination a");
          return pagination.length;
        });

        console.log("Đã lấy được số pagination là", pagination);
        for (let i = 2; i <= 4; i++) {
          console.log("Chuyển đến trang số", i - 1);
          await frame.click(`.pageWp .pagination a:nth-child(${i + 1})`, {
            waitUntil: "networkidle2",
          });
          await frame.waitForSelector(".secMdle .tb01");

          let dt = await frame.evaluate(() => {
            let data = [];
            let elements = document.querySelectorAll(".tb01 tbody tr");

            for (let el of elements) {
              let obj = {};
              let photo = el && el.querySelector(".TDmodel .photo img");

              if (el && el.getAttribute("onclick")) {
                let link = el.getAttribute("onclick");
                obj.link = link;
              }

              if (photo) {
                obj.image = photo.src;
              }

              if (Object.keys(obj).length > 0) {
                data.push(obj);
              }
            }
            return data;
          });

          dataFile = [...dataFile, ...dt];
        }
        await frame.click(" .pageWp .pagination a.arrowNext", { waitUntil: "networkidle2" });
        await frame.waitForSelector(".secMdle .tb01");
      } while (page < totalPage / 10);

      console.log("Đã lấy được tổng số dòng là", dataFile[dataFile.length - 1]);
      fs.writeFileSync("dautomall.json", JSON.stringify(dataFile));
      await pageTemp.close();
    } catch (error) {
      this.scraper(browser);
      console.log(error);
    }
  },
};

module.exports = scraperObject;
