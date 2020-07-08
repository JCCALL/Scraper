var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");
var Handlebars = require("handlebars")
var exphbs = require("express-handlebars");
var {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');

var db = require("./models");

var PORT = process.env.PORT || 3000;

var app = express();

app.use(logger("dev"));
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main", handlebars: allowInsecurePrototypeAccess(Handlebars) }));
app.set("view engine", "handlebars");


var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";

mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

app.get("/", function(req, res) {
    db.Article.find({}).then(function(response) {
        var dbData = {
            articles: response
        };
        res.render("index", dbData);
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

app.get("/articles", function(req, res) {
    db.Article.find({}).sort({_id: -1}).then(function(data){
        res.send(data);
    }).catch(function (err) {
        console.log(err);
        res.send(err)
    })
});

app.get("/articles/:id", function(req, res) {
    db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(data){
        res.json(data);
    }).catch(function(err) {
        console.log(err);
        res.send(err);
    });
});

app.post("/articles/:id", function(req, res) {
    db.Note.create(req.body)
        .then(function(dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { notes: dbNote._id }, { new: true });
        }).catch(function(err) {
            console.log(err);
            res.json(err);
        });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });