const mangoose = require("mongoose");


const postSchema = new mangoose.Schema({
    image: String,
    caption: String,
});

const postModel = mangoose.model("post", postSchema);

module.exports = postModel;