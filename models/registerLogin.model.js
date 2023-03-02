const db = require("../db/connection");
const argon2 = require("argon2");

exports.insertUser = async ({
  username,
  name,
  email,
  profile_pic,
  password,
}) => {
  if (!username || !password || !email || !name)
    return Promise.reject({ status: 400, msg: "missing required fields" });

  if (
    (await db.query("SELECT * FROM users WHERE username = $1;", [username]))
      .rows.length > 0
  ) {
    return Promise.reject({ status: 400, msg: "username taken" });
  }

  const hash = await argon2.hash(password);

  const {
    rows: [row],
  } = await db.query(
    "INSERT INTO users (username, name, email, profile_pic, hash) VALUES ($1, $2, $3, $4, $5) RETURNING *;",
    [username, name, email, profile_pic, hash]
  );

  delete row.hash;

  return row;
};

exports.checkUser = async ({ username, password }) => {
  const {
    rows: [row],
  } = await db.query("SELECT * FROM users WHERE username=$1;", [username]);

  if (!row) return { verified: false, msg: "User Not Found" };

  const result = await argon2.verify(row.hash, password);

  if (!result) return { verified: false, msg: "Password Incorrect" };
  else {
    delete row.hash;

    return { verified: true, msg: "User Logged In", user: row };
  }
};

exports.checkUserNameFree = async ({ username }) => {
  const {
    rows: [row],
  } = await db.query("SELECT * FROM users WHERE username=$1;", [username]);

  if (!row) {
    return true;
  } else {
    return false;
  }
};
