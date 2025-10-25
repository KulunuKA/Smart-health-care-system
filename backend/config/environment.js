const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const ENVIRONMENT = process.env.NODE_ENV.trim();

export const SERVER = Object.freeze({
  APP_NAME: "Urban Hospitals",
  APP_LOGO:
    "https://wishwell-development.s3.amazonaws.com/1607946234266_Sqlv5.svg",
  TEMPLATE_PATH: process.cwd() + "/src/views/",
  UPLOAD_DIR: process.cwd() + "/src/uploads/",
  LOG_DIR: process.cwd() + "/logs",
  TOKEN_INFO: {
    // LOGIN_EXPIRATION_TIME: "180d", // 180 days
    EXPIRATION_TIME: {
      USER_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
      ADMIN_LOGIN: 180 * 24 * 60 * 60 * 1000, // 180 days
    },
    ISSUER: process.env["APP_URL"],
  },
  JWT_PRIVATE_KEY: process.cwd() + "/keys/jwtRS256.key",
  JWT_PUBLIC_KEY: process.cwd() + "/keys/jwtRS256.key.pub",
  // for private.key file use RS256, SHA256, RSA
  JWT_ALGO: "RS256",
  SALT_ROUNDS: 10,
  ENC: "102938$#@$^@1ERF",
  CHUNK_SIZE: 1000,
  APP_URL: process.env["APP_URL"],
  API_BASE_URL: "/api",
  MONGO: {
    DB_NAME: process.env["DB_NAME"],
    DB_URL: process.env["DB_URL"],
    OPTIONS: {
      user: process.env["DB_USER"],
      pass: process.env["DB_PASSWORD"],
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    },
    REPLICA: process.env["DB_REPLICA"],
    REPLICA_OPTION: {
      replicaSet: process.env["DB_REPLICA_SET"],
      authSource: process.env["DB_AUTH_SOURCE"],
      ssl: process.env["DB_SSL"],
    },
  },

  ADMIN_CREDENTIALS: {
    EMAIL: process.env["ADMIN_EMAIL"],
    PASSWORD: process.env["ADMIN_PASSWORD"],
    FIRST_NAME: process.env["ADMIN_FIRST_NAME"],
    LAST_NAME: process.env["ADMIN_LAST_NAME"],
  },

  ENVIRONMENT: process.env["ENVIRONMENT"],
  STRIPE_SECRETE: process.env["STRIPE_SECRETE_KEY"],
});
