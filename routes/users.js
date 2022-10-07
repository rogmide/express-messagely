const express = require("express");
const router = express.Router();
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { route } = require("./auth");
const User = require("../models/user");

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/

router.get("/", async (req, res, next) => {
  try {
    let users = await User.all();
    res.send(users);
  } catch (error) {
    next(error);
  }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", async (req, res, next) => {
  try {
    let user = await User.get(req.params.username);
    res.send(user);
  } catch (error) {
    next(error);
  }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to", async (req, res, next) => {
  try {
    let msgs = await User.messagesTo(req.params.username);
    res.send(msgs);
  } catch (error) {
    next(error);
  }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from", async (req, res, next) => {
  try {
    let msgs = await User.messagesFrom(req.params.username);
    res.send(msgs);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
