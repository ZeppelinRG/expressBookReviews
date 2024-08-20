const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    username = req.session.authorization["username"];
    if (!username) {
        res.status(405).json({message: "Please log in first."});
    }

    review = req.query.review;
    if (!review) {
        res.status(406).json({message: "Invalid review."});
    }

    isbn = req.params.isbn;
    if (!books[isbn]) {
        res.status(407).json({message: "ISBN not found!"});
    }

    bookReviews = books[isbn]["reviews"];
    bookReviews = {...bookReviews, [username]:review};
    books[isbn]["reviews"] = bookReviews;
    return res.send(`The review for the book with ISBN ${isbn} has been added/updated.`);
});

//Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    username = req.session.authorization["username"];
    if (!username) {
        res.status(405).json({message: "Please log in first."});
    }

    isbn = req.params.isbn;
    if (!books[isbn]) {
        res.status(407).json({message: "ISBN not found!"});
    }

    if (books[isbn]["reviews"][username]) {
        delete books[isbn]["reviews"][username];
        return res.send(`Reviews for the book with ISBN ${isbn} posted by the user ${username} deleted.`);
    }
    else {
        res.status(408).json({message: "There are no reviews by this user for this ISBN."});
    }
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
