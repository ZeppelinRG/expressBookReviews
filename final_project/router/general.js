const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    if (username && password) {
      if (!isValid(username)) {
        users.push({ "username": username, "password": password });
        return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
      } else {
        return res.status(404).json({ message: "User already exists!" });
      }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(books);
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.send(books[isbn]);
    }
    return res.send("ISBN not found!");
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    let isbn = Object.keys(books);
    let existingAuthor = [];
    for (let i = 1; i < isbn.length + 1; i++) {
        if (books[i]["author"] === req.params.author) {
            const book = {"isbn": i, "title": books[i]["title"], "reviews": books[i]["reviews"]};
            existingAuthor.push(book);
        }
    }
    const final = {"booksbyauthor": existingAuthor};
    return res.send(final);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    let isbn = Object.keys(books);
    let existingTitle = [];
    for (let i = 1; i < isbn.length + 1; i++) {
        if (books[i]["title"] === req.params.title) {
            const book = {"isbn": i, "author": books[i]["author"], "reviews": books[i]["reviews"]};
            existingTitle.push(book);
        }
    }
    const final = {"booksbytitle": existingTitle};
    return res.send(final);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.send(books[isbn]["reviews"]);
    }
    return res.send("ISBN not found!");
});

module.exports.general = public_users;
