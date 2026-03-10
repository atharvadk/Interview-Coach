const axios = require("axios");

const fastapi = axios.create({
  baseURL: process.env.FASTAPI_URL || "http://localhost:8000",
  timeout: 60000
});

module.exports = fastapi;