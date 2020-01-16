//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose')
const _ = require('lodash');

var Schema = mongoose.Schema

const url = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}`
mongoose.connect(url, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
})


const itemSchema = new Schema({
  name: String
})

const Item = mongoose.model('Item', itemSchema)

const getDefaultItems = () => {
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
  return items
}

const insertDefaultObjects = (res) => {
  const items = getDefaultItems()

  // if empty insert default objects
  Item.insertMany(items, (err) => {
    if (err) {
      console.log(err)
    } else {
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
        listTitle: "Personal",
        newListItems: items,
        date: day
      });
    }
  })
});

const listSchema = new Schema({
  name: String,
  items: [itemSchema]
})

const List = mongoose.model('List', listSchema)

app.get("/:customListname", function(req, res) {
  const items = getDefaultItems()
  const day = date.getDate()
  const customListname = _.capitalize(req.params.customListname)

  List.findOne({name: customListname}, (err, foundList) => {
    if (!foundList) {
      const list = new List({
        name: customListname,
        items: items
      })

      list.save()
      res.redirect(`/${customListname}`)
    } else {
      res.render(`list`, {
        listTitle: foundList.name,
        newListItems: foundList.items,
        date: day
      })
    }
  })
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if(listName === "Personal") {
    item.save()
    res.redirect("/")
  } else {

    List.findOne({name: listName}, (err, foundItem) => {
      foundItem.items.push(item)
      foundItem.save()
      res.redirect(`/${listName}`)
    })
  }

});

app.post("/delete", function(req, res) {
  const itemId = req.body.checkbox
  const listName = req.body.listName

  const item = new Item({
    name: listName
  })

  if(listName === "Personal") {
    Item.deleteOne({_id: itemId}, (err) => {
      if (err) {
        console.log(err)
      } else {
        res.redirect("/")
      }
    })
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: itemId}}}, (err, foundList) => {
      if(!err) {
        res.redirect(`/${listName}`)
      }
    })
  }
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
