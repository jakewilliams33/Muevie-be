const db = require("../db/connection");

exports.selectFollowingByUserId = async (user_id, order = "DESC") => {
  if (!["ASC", "DESC"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid order query" });
  }

  const isFollowing = (
    await db.query(
      `SELECT users.user_id, username, profile_pic, name, followers.created_at FROM followers 
    LEFT JOIN users
    ON users.user_id = followers.following
    WHERE followers.user_id=$1
    ORDER BY followers.created_at ${order}
`,
      [user_id]
    )
  ).rows;

  const followedBy = (
    await db.query(
      `SELECT followers.user_id, username, profile_pic, name, followers.created_at FROM followers 
    LEFT JOIN users
    ON users.user_id = followers.user_id
    WHERE following=$1
    ORDER BY followers.created_at ${order}
`,
      [user_id]
    )
  ).rows;

  const response = { followers: followedBy, following: isFollowing };

  return response;
};

exports.insertFollowing = async (user_id, following) => {
  const {
    rows: [row],
  } = await db.query(
    `INSERT INTO followers (user_id, following) VALUES ($1, $2) RETURNING *;`,
    [user_id, following]
  );
  return row;
};

exports.removeFollowing = async (user_id, following) => {
  const {
    rows: [row],
  } = await db.query(
    `DELETE FROM followers WHERE user_id=$1 AND following=$2 RETURNING *;`,
    [user_id, following]
  );
  return row;
};
