//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const _=require("lodash");
const mongoose=require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-aryaman:Ouraryu@cluster0.pph9r.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema={name:String};
const Item=mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"welcome to your to do list"
});
const item2=new Item({
  name:"hit the + button to add a new item."
});
const item3= new Item({
  name:"<-- hit this to delete an item"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name :String,
  items:[itemsSchema]
};
const workItems = [];

app.get("/", function(req, res) {

Item.find({},function(err,foundItems){
  if(foundItems.length===0)
  {
    Item.insertMany(defaultItems,function(err){
     if(err){console.log(err);}
     else {
       console.log("no error");
     }
    });
    res.redirect("/");
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});


});
app.get("/:customListName",function(req,res)
{
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
}
      else{
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }

  });

});
const List=mongoose.model("List",listSchema);
app.post("/delete",function(req,res){
  const checked=req.body.checkbox;
  const listName=req.body.listName;


    if(listName==="Today")
    {
      Item.findByIdAndRemove(checked,function(err){
        if(err)
        {
          console.log(err);
        }
        else {
          console.log("success mf");
          res.redirect("/");
        }
      });
    }
    else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checked}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }

    });
    }
  });
app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
    const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");

  }
  else {
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    });
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT;
if(port==null||port==""){
  port=3000;
}
app.listen(port);
