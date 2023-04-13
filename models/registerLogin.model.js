const db = require("../db/connection");
const argon2 = require("argon2");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

require("dotenv").config({
  path: `${__dirname}/../.env.aws_config`,
});

const credentials = {
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
};

const client = new S3Client(credentials);

exports.insertUser = async ({
  username,
  name,
  email,
  picture_file,
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

  if (picture_file) {
    const blob = picture_file.buffer;
    const imagePath = `${picture_file.fieldname}_${Date.now()}_${
      picture_file.originalname
    }`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: imagePath,
      Body: blob,
    });

    try {
      await client.send(command);
      profile_pic = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${imagePath}`;
    } catch (err) {
      console.log(err);
    }
  } else {
    profile_pic =
      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png";
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
