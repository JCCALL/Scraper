var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static("public"));

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function(req, res) {
    db.Article.find({}).then(function(data) {
        var dbData = {
            articles: data
        };
        res.render('index', dbResponse);
    }).catch(function (err) {
        console.log(err);
        res.send(err);
    });
});

app.get("/scrape", function(req, res) {
    axios.get("https://www.ripleys.com/weird-news/").then(function(response) {
        var $ = cheerio.load(response.data);
        $("Article").each(function(i, element) {
            var result= {};

            result.title = $(element)
                .children("div")
                .children("h3")
                .children("a")
                .text();
            
            result.summary = $(element)
                .children("div")
                .children("div")
                .children("p")
                .text();
            
            result.link = $(element)
                .children("div")
                .children("h3")
                .children("a")
                .attr("href");

            result.image = $(element)
                .children("div")
                .children("a")
                .children("img")
                .attr("src")
                
            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    console.log(err);
                });
        });
        res.send("Scrape Complete");
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });