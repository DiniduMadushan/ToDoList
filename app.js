const express = require("express");
const bodyParser = require("body-parser");
const date =require(__dirname+"/date.js");
const app = express();


const newItems = ["buy foods","cook foods","eat foods"];

const workItems = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

app.get("/", function(req,res){

    const day = date.getDate();

    res.render("list" , {
        listTitle:day,
        newListItems : newItems
    });
    
});

app.post("/", function(req,res){

    const newItem = req.body.newItem;

    console.log(req.body);

    if(req.body.list === "work"){
        workItems.push(newItem);
        res.redirect("/work");
    }else{
        newItems.push(newItem);
        res.redirect("/");
    }
    
    
});

app.get("/work", function(req,res){
    res.render("list", {listTitle : "work" , newListItems: workItems});
});

app.post("/work" ,function(req,res){
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(req,res){
    res.render("about");
});



app.listen(3000, function(){
    console.log("server started on port 3000");
});