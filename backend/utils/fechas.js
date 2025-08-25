const moment = require("moment-timezone");

function fechaHoy() {
  return moment().tz("America/Bogota").format("YYYY-MM-DD");
}

function fechaHoraActual() {
  return moment().tz("America/Bogota").format("YYYY-MM-DD HH:mm:ss");
}

module.exports = { fechaHoy, fechaHoraActual };
