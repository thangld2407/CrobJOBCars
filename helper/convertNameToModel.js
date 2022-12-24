function convertNameToModel(name) {
  const nameTrim = name.trim();
  let model = "";
  if (nameTrim.length > 0) {
    const arrName = nameTrim.split(" ");
    if (arrName[1].length === 1) {
      model = arrName[1] + " " + arrName[2] || "";
    } else {
      model = arrName[1] || "";
    }
  }

  return model.trim() || "";
}

module.exports = convertNameToModel;
