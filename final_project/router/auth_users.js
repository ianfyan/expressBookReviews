const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    const user = users.find(user => user.username === username);
    return !user;
}

const authenticatedUser = (username,password)=>{
    const user = users.find(user => user.username === username && user.password === password);
    return user !== undefined;
}

regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password must be provided" });
    }

    if (isValid(username)) {
      return res.status(401).json({ message: "User is not registered yet" });
    }

    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });

    req.session.token = token;
    req.session.username = username;
    
    return res.status(200).json({ message: "Customer successfully logged in", token });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "The book with the ISBN was not found" });
  }

  if (!review) {
    return res.status(400).json({ message: "Reviews must be provided as query parameters" });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/modified", reviews: book.reviews });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.username;

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "The book with the ISBN was not found" });
  }

  if (!book.reviews || !book.reviews[username]) {
    return res.status(404).json({ message: "No reviews from this user found" });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Review successfully deleted", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
