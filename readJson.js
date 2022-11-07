const fs = require("fs");
function fetchJson() {
  const json = fs.readFileSync("data.json");
  let data = JSON.parse(json);
  let fuel = [];
  data.map((item) => {
    fuel.push(item.basic_infor.fuel_type);
  });
  fuel = fuel.filter((item, index) => fuel.indexOf(item) === index);
  fs.writeFileSync("fuel.json", JSON.stringify(fuel));
  return fuel;
}

fetchJson();
