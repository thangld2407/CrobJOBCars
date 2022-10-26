const mongoose = require("mongoose");
const request = require("request-promise");
const cheerio = require("cheerio");

const URL = "https://www.djauto.co.kr";
/**
 * Get content for each page
 *
 * @param {*} uri (Ex: ${URL}page/2)
 */
const getPageContent = (uri) => {
  const options = {
    uri,
    transform: (body) => {
      return cheerio.load(body);
    },
  };

  return request(options);
};

getPageContent(`${URL}/car/carList.html?cho=1`).then(($) => {
  html2DataDJAuto($);
});

const html2DataDJAuto = ($) => {
  const data = [];
  $(".car_list tbody").each((_, c) => {
    const $tr = $(c).find("tr");
    const $td = $tr.find("td");
    const $price = $td.find(".money b:first-child");
    const $link = $td.find(".left a.subject");
    const $car_name = $td.find(".left a.subject b");
    const $image = $td.find(".photo a");
    const $model_year = $tr.find("td.year");

    $price.each((_, c) => {
      const price = $(c).text().replace(/,/g, "");
      data.push({
        price: parseInt(price),
      });
    });

    $link.each((_, c) => {
      const link = $(c).attr("href");
      data[_].link = `https://www.djauto.co.kr${link}`;
      data[_].scar_code = link.split("/")[2];
    });

    $image.each((_, c) => {
      const image = $(c).find("img").attr("src");
      data[_].image_url = `https://www.djauto.co.kr${image}`;
    });

    $model_year.each((_, c) => {
      const model_year = $(c).text().trim();
      data[_].model_year = model_year;
    });

    $car_name.each((_, c) => {
      const car_name = $(c).text().trim();
      data[_].car_name = car_name;
    });
  });

  console.log(data[0]);

  return data;
};
