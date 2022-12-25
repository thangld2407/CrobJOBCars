require("dotenv").config();
const cron = require("node-cron");
const scrapDautomall = require("./scraper/page_dautomall");

scrapDautomall();
