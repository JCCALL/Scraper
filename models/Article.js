var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var ArticleSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    
    summary: {
        type: String,
        required: true
    },

    link: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: false,
        default: "https://pbs.twimg.com/profile_images/1158344285407854593/-9PjWt-v_400x400.jpg"
    },

    note: {
        type: Schema.Types.ObjectId,
        ref: "Note"
    }
});

var Article = mongoose.model("Article", ArticleSchema);

module.exports = Article;