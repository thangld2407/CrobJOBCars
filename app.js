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
  console.log(html2Data($));
});

const html2Data = ($) => {
  const data = [];
  $(".car_list tbody").each((_, c) => {
    const $c = $(c);
    const $tr = $c.find("tr");
    const $td = $tr.find("td");
    const $img = $td.find("img");
    const $a = $td.find(".money b:first-child");
    const $span = $td.find("span");

    const car = {
      image: $img.attr("src"),
      title: $a.text(),
      price: $span.text(),
    };

    data.push(car);
  });

  return data;
};
