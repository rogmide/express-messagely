/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const User = require("../models/user");
const { SECRET_KEY } = require("../config");

router.get("/", async (req, res, next) => {
  try {
    res.send("Auth Route");
  } catch (error) {
    next(error);
  }
});

router.post("/register", async (req, res, next) => {
  const { username, password, first_name, last_name, phone } = req.body;
  if (!username || !password || !first_name || !last_name)
    return next(new ExpressError(`All form the to be fill`, 400));

  // let user = new User({
  //   username,
  //   password,
  //   first_name,
  //   last_name,
  //   phone,
  // });

  try {
    let user = await User.register(
      username,
      password,
      first_name,
      last_name,
      phone
    );
    if (user.code === "23505")
      return next(
        new ExpressError(`Username is already taken, Please pick another!`, 400)
      );
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password)
    return next(new ExpressError(`Username and password require`, 400));

  // let user = new User({ username, password });
  // token = await user.authenticate();
  let token = await User.authenticate(username, password);
  return res.json({ token });
});

module.exports = router;
