const { default: axios } = require("axios");
const { load } = require("cheerio");
const moment = require("moment");
const badword = require("./bad-word.json");

const BASE_URL = "https://www.1377x.to";

const Scrap1337x = ($) => {
  let torrents = [];

  // get all data from table which has Most Popular Torrents this week in header
  $("table.table-list tbody tr").each(async (i, el) => {
    let torrent = {};
    torrent.name = $(el).find("td.coll-1.name").text();

    // check if torrent name contains bad words
    if (badword.some((word) => torrent.name.toLowerCase().includes(word))) {
      console.log("bad word found >> ", torrent.name);
      return;
    }

    torrent.seed = $(el).find("td.coll-2").text();
    torrent.leeches = $(el).find("td.coll-3").text();
    torrent.size = $(el).find("td.coll-4").text();
    torrent.date = $(el).find("td.coll-date").text();
    torrent.uploader = $(el).find("td.coll-5").text();

    // load the torrent page to get the magnet link
    // target 2nd a tag
    let torrentPage = $(el).find("td.coll-1.name a").eq(1).attr("href");
    torrent.pageUrl = torrentPage;

    // convert size in one format
    let size = torrent.size;
    if (size.includes("GB")) {
      size = size.replace("GB", "");
      size = parseFloat(size) * 1024;
    } else if (size.includes("MB")) {
      size = size.replace("MB", "");
      size = parseFloat(size);
    } else if (size.includes("KB")) {
      size = size.replace("KB", "");
      size = parseFloat(size) / 1024;
    }
    torrent.sizeInt = size;

    //convert date  to milliseconds
    let date = torrent.data;
    // convert date  to MM-DD-YYYY format
    date = moment(date, "MMM DD YYYY").format("DD-MM-YYYY");
    torrent.dateInt = moment(date, "DD-MM-YYYY").valueOf();

    torrents.push(torrent);
  });
  return torrents;
};

const test = async (req, res) => {
  const webResponse = await axios.get(BASE_URL + "/home");
  let html = webResponse.data;
  let $ = load(html);

  let torrents = Scrap1337x($);
  res.send(torrents);
};

const getTorInfo = async (req, res) => {
  const { url } = req.query;
  console.log("url >> ", BASE_URL + url);
  const webResponse = await axios.get(BASE_URL + url);
  let html = webResponse.data;
  let $ = load(html);
  let data = {};
  let l = [];

  data.title = $("div.box-info-heading h1").text();

  // select all ul.list
  let lists = $("ul.list");
  // select 2nd list
  let list = lists.eq(1);
  $(list)
    .find("li")
    .each((i, el) => {
      // select first child of li
      let a = $(el).children().eq(0);
      // select 2nd child
      let b = $(el).children().eq(1);
      data[a.text()] = b.text();
    });

  let list2 = lists.eq(2);
  $(list2)
    .find("li")
    .each((i, el) => {
      // select first child of li
      let a = $(el).children().eq(0);
      // select 2nd child
      let b = $(el).children().eq(1);
      data[a.text()] = b.text();
    });

  //select href which has magnet link
  let magnet = $("a[href^='magnet']").attr("href");
  data["magnet"] = magnet;

  // select torrent-detail clearfix
  let torrentDetail = $("div.torrent-detail.clearfix");

  // select image src from torrent-image-wrap
  let image = $(torrentDetail).find("div.torrent-image-wrap img").attr("src");
  // if image loaded from 1377x.to then add base url
  if (image && image.startsWith("/")) {
    image = BASE_URL + image;
    //load image
    let imageResponse = await axios.get(image, {
      responseType: "arraybuffer"
    });
    data["image"] = imageResponse.data.toString("base64");
  }

  let description = $(torrentDetail).text();
  data["description"] = description ?? "";

  // select torrent-category clearfix

  let torrentCategory = $("div.torrent-category.clearfix");

  // loop through all span and get text
  let type = [];
  $(torrentCategory)
    .find("span")
    .each((i, el) => {
      type.push($(el).text());
    });
  data["genre"] = type;
  res.send(data);
};

const search = async (req, res) => {
  try {
    const { query } = req.query;
    console.log("query >> ", query);
    const webResponse = await axios.get(BASE_URL + "/search/" + query + "/1/");
    let html = webResponse.data;
    let $ = load(html);

    let torrents = Scrap1337x($);
    res.status(200).send(torrents);
  } catch (e) {
    console.log(e);
    res.status(500).send(e);
  }
};

exports.test = test;
exports.getMagnets = getTorInfo;
exports.search = search;
