const format = require("pg-format");
const db = require("../connection");

exports.checkExists = async (table, column, value) => {
  const queryStr = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  const { rows } = await db.query(queryStr, [value]);

  if (rows.length === 0 && table === "genres") {
    return Promise.reject({
      status: 400,
      msg: "No posts under that genre yet!",
    });
  } else if (rows.length === 0) {
    return Promise.reject({
      status: 404,
      msg: "Resource not found",
    });
  }
};
