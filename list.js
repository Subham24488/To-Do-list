const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();
var day = "";
const _ = require("lodash");

app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static("public"));
app.set("view engine", "ejs");

mongoose.connect("mongodb+srv://admin-subham:g87979947990S@cluster0-cnvqu.mongodb.net/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
//task schema
const tasksSchema = new mongoose.Schema({
  name: String,
});

const Tasks = mongoose.model("Tasks", tasksSchema);

const task1 = new Tasks({
  name: "enter your task below"
});

const task2 = new Tasks({
  name: "use+ to add"
});
const task3 = new Tasks({
  name: "new item will be added"
});

const defaulitems = [task1, task2, task3];

//list Schema
const listSchema = new mongoose.Schema({
name:String,
items:[tasksSchema]

});
console.log(listSchema.items);
const Lists = mongoose.model("Lists", listSchema);



//get method
app.get("/", function(req, res) {

// getting date
  const date = new Date();

  const option = {
    weekday: "long",
    day: "numeric",
    month: "long"

  };

day = date.toLocaleDateString("en-US", option);
console.log(day);
  //finding the database elements
  Tasks.find({}, function(err, mytasks) {

if(mytasks.length === 0){
  Tasks.insertMany(defaulitems, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
    }
  });
res.redirect("/");

}else{
    res.render("list", {
          FOO: day,
          TASKS: mytasks
        });
}
  });

});

//creating new custom pages
app.get("/:customlistname", function(req, res){

const customPages = _.capitalize(req.params.customlistname);

Lists.findOne({name:customPages}, function(err, foundList){
if(!err){
if(!foundList){
  const list = new Lists({
  name:customPages,
  items:defaulitems
  });
  list.save();
  res.redirect("/"+ customPages);
}else{
  res.render("list", {
      FOO: foundList.name,
      TASKS: foundList.items
    });


}
}
});

});

//post Method
app.post("/", function(req, res) {
  const taskItems = req.body.newTask;
const listName = req.body.list;

  const tasks = new Tasks({
    name: taskItems
  });
if(listName === day){
  tasks.save();
    res.redirect("/");
}else{
  Lists.findOne({name:listName}, function(err, foundlist){
    console.log(foundlist);
     foundlist.items.push(tasks);//value of item is considered to be null
    foundlist.save();
    res.redirect("/" + listName);

});
}


});

app.post("/delete", function(req, res){

var tasksID = req.body.checkbox;
const listName = req.body.listName;

if(listName === day){
  Tasks.findByIdAndRemove(tasksID, function(err){
  if(!err){
    console.log("success")
  }
  res.redirect("/");
  })
}else{
Lists.findOneAndUpdate({name:listName}, {$pull:{items:{_id:tasksID}}}, function(err, foundList){
if(!err){
res.redirect("/" + listName);
}
});
}
});
//listening to port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("server has started sucessfully");

});
