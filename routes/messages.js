/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Message = require("../models/message");

router.get("/", async (req, res, next) => {
  try {
    return res.send("Messages Route");
  } catch (error) {
    return next(error);
  }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/

router.post("/", async (req, res, next) => {
  try {
    let from_username = req.user.username;
    const { to_username, body } = req.body;
    console.log(to_username, body);
    console.log(from_username);
    let msg = await Message.create({ from_username, to_username, body });
    return res.json(msg);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
