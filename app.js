
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const req = require("express/lib/request");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public")); // for using CSS

mongoose.connect("mongodb://localhost:27017/WikiDB");

const articleSchema = {
    title: String,
    content: String 
};

const Article = mongoose.model("Article",articleSchema);

/* ----------------- Requests targetting all articles ------------------------------ */

app.route("/articles") // chained route

.get(function(req,res)  // GET ALL Articles request
{
    Article.find(function(err, foundArticles)
    {
        if(!err)
        {
            res.send(foundArticles);
        }
        else
        {
            res.send(err);
        }
    })
})

.post(function(req,res)
{  // title and content are the names of the variables

    const newArticle = new Article({  // we get a post req from post man with title and content that we save into MongoDB
        title: req.body.title,
        content: req.body.content
    });

    newArticle.save(function(err)
    {
        if(!err)
        {
            res.send("Successfully added a new article");
        }
        else
        {
            res.send(err);
        }
    });
})

.delete(function(req,res) // if lient makes delete request to articles route we delete everything from articles collection 
{
    Article.deleteMany(function(err) // here Article is the collection name.
    {
        if(!err)
        {
            res.send("Successfully deleted al documents");
        }
        else
        {
            res.send(err);
        }
    });
});  /* Put semicolon only at the very end of chained route */

/* ----------------- Requests targetting a specific article ------------------------------ */

app.route("/articles/:articleTitle") // here we're targetting this specific article whose title is "articleTitle"

.get(function(req,res){
    Article.findOne({title: req.params.articleTitle}, function(err,foundArticle){
        if(foundArticle)
        {
            res.send(foundArticle);
        }
        else
        {
            res.send("No article matching that title was found.")
        }
    });
})

.put(function(req,res)  // it will look for the article specified in the url and update it
{
    Article.findOneAndUpdate(  
        {title: req.params.articleTitle},  // condition to find a specific doc
        {title: req.body.title, content:req.body.content},  // we are actualling updating a doc. Here the ".title" & ".content"are the variables and in postman we have to use same names 
        {overwrite: true},
        function(err)
        {
            if(!err)
            {
                res.send("Successfully updated article");
            }
        }
    );
})

.patch(function(req,res)  // it replaces only that parts of the documents that we pass in patch request from postman
{
    Article.update(
        {title: req.params.articleTitle},  // identifies which doc to patch
        {$set: req.body}, // main patching code. It automatically identifies what re the new things passed and updates them in that specific doc
        function(err)
        {
            if(!err)
            {
                res.send("Successfully updated article.");
            }
            else
            {
                res.send(err);
            }
        }
    );
})

.delete(function(req,res)
{
    Article.deleteOne(
        {title: req.params.articleTitle},
        function(err)
        {
            if(!err)
            {
                res.send("Successfully deleted the corresponding article.");
            }
            else
            {
                res.send(err);
            }
        }
    );
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});