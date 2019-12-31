//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')

var Schema = mongoose.Schema

const url = "mongodb://localhost:27017/todolistDB"
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true
})

const itemSchema = new Schema({
  name: String
})

const Item = mongoose.model('Item', itemSchema)

const insertDefaultObjects = (res) => {
  const macbookPro = new Item({
    name: "Make food"
  })
  const boseHeadset = new Item({
    name: "Eat food"
  })
  const smartphone = new Item({
    name: "Do dishes"
  })

  const items = [macbookPro, boseHeadset, smartphone]

  // if empty insert default objects
  Item.insertMany(items, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Default items added to the database")
      res.redirect("/")
    }
  })
}

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.get("/", function(req, res) {
  const day = date.getDate();

  // Getting the items from the database
  Item.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else if (items.length === 0) {
      insertDefaultObjects(res)
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: items
      });
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;

  const item = new Item({
    name: itemName
  })

  item.save()
  res.redirect("/")
});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox;
  console.log(itemId)
  Item.deleteOne({_id: itemId}, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log("Item deleted.");
      res.redirect("/")
    }
  })
});

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
