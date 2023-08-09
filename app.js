import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs";
import mongoose from 'mongoose';

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/wikiDB');

    const articlesSchema = new mongoose.Schema({title: String, content: String});
    const Article = mongoose.model('Articles', articlesSchema);

    app.route('/articles')
    .get(async (req, res) => {
        const foundArticles = await Article.find({});
        res.send(foundArticles);
    })
    .post(async (req, res) => {
        await Article.insertMany([new Article({title: req.body.title, content: req.body.content})]);
        res.status(200).send("Saved succesfully!");
    })
    .delete(async (req, res) => {
        await Article.deleteMany({});
        res.status(200).send("Deleted succesfully!");
    });

    app.route('/articles/:articleTitle')
    .get(async (req, res) => {
        const foundArticle = await Article.findOne({title: req.params.articleTitle});
        res.send(foundArticle);
    })
    .put(async (req, res) => {
        const foundArticle = await Article.findOne({title: req.params.articleTitle});

        if (!foundArticle) {
            res.status(404).send('Do not have that article!');
            return;
        }

        try {
            const matchedArticleCount = await Article.replaceOne({_id: foundArticle._id}, {title: req.body.title, content: req.body.content});
            res.status(200).send("Modified put succesfully!");
        } catch(err) {
            console.log(err);
            res.status(404).send('Could not replace put!');
        }
    })
    .patch(async (req, res) => {
        const foundArticle = await Article.findOne({title: req.params.articleTitle});

        if (!foundArticle) {
            res.status(404).send('Do not have that article!');
            return;
        }

        try {
            await Article.updateOne({_id: foundArticle._id}, {title: req.body.title, content: req.body.content});
            res.status(200).send("Modified patch succesfully!");
        } catch(err) {
            console.log(err);
            res.status(404).send('Could not replace patch!');
        }
    })
    .delete(async (req, res) => {
        const foundArticle = await Article.findOne({title: req.params.articleTitle});

        if (!foundArticle) {
            res.status(404).send('Do not have that article!');
            return;
        }

        try {
            const matchedArticleCount = await Article.findByIdAndDelete(foundArticle._id);
            res.status(200).send("Deleted one article succesfully!");
        } catch(err) { 
            console.log(err);
            res.status(404).send('Could not delete!');
        }
    });

    app.listen(3000, () => {
        console.log("Server started on port 3000");
    });
}
main();
