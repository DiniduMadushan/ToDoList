const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose"); 
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

//connect to the database

mongoose.connect("mongodb://localhost:27017/todolistDB").then(() =>{
    console.log("database successfully connected");
}).catch((error) => {
    console.error(error);
})

//create the scheema
const itemsSchema = new mongoose.Schema({
    name: String
});

//create the model
const Item = mongoose.model("Item",itemsSchema);


//insert items
const item1 = new Item({
    name:"Welcome to your to-do list"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- hit this to delete the item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

// const listSchema = new mongoose.Schema({
//     name: String,
//     items: [itemSchema]
//   });

const List = mongoose.model("List", listSchema);


app.get("/", function(req,res){

   Item.find().then(listItems =>{

    if(listItems.length === 0){
        Item.insertMany(defaultItems).then(() =>{
            console.log("Items has successfully added");
        }).catch((error) => {
            console.error(error);
        });

        res.redirect("/");

    }else{
        res.render("list", {listTitle:"Today", newListItems:listItems});
    }
    
   });
   
});


app.post("/", function(req,res){

    const itemName = req.body.newItem;
    const listName = req.body.list;
    
    const item = new Item({name:itemName});

    if(listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName}).then(foundList => {
            if(foundList){
                foundList.items.push(item);
                foundList.save().then(()=>{
                    res.redirect("/"+listName);
                }).catch(err =>{
                    console.log("Error while saving the item: "+err);
                })
            }else{
                console.log();
            }
        }).catch(err =>{
            console.log("Error occured: "+err);
        })
    }

    


 
});

app.post("/delete", function(req,res){
    
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today"){
        Item.deleteOne({ _id: checkedItemId })
        .then(result => {
          if (result.deletedCount > 0) {
            console.log("Item has been successfully deleted");
          } else {
            console.log("No items matched the query. Nothing was deleted.");
          }
        })
        .catch(err => {
          console.log("Error while deleting list item: " + err);
        });
      
        res.redirect("/");
    }else{
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:checkedItemId}}}).then(result => {
            console.log("Item has successfully deleted: ",result);
            res.redirect("/"+listName);
        }).catch(err => {
            console.log("Error while removing item: "+err);
        });
 
    }

   

});

app.get("/:customListName", function(req,res){

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}).then(foundList => {
        if(!foundList){
            //create a new list
            const list = new List({
                name: customListName,
                items: defaultItems
            });
        
            list.save();

            res.redirect("/" +customListName);

        }else{
            //show an existing list
            res.render("list", {listTitle:foundList.name, newListItems: foundList.items});
        }
    }).catch(err => {
        console.log("Error occured: " +err);
    });

   

});

app.post("/work" ,function(req,res){
   
});


app.listen(3000, function(){
    console.log("server started on port 3000");
});