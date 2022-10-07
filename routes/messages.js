const express = require("express");
const router = express.Router();
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
    let msg = await Message.create({ from_username, to_username, body });
    return res.json(msg);
  } catch (error) {
    return next(error);
  }
});

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

router.get("/:id", async (req, res, next) => {
  try {
    let msg = await Message.get(req.params.id);
    return res.json(msg);
  } catch (error) {
    return next(error);
  }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/

router.post("/:id/read", async (req, res, next) => {
  try {
    let msg = await Message.markRead(req.params.id);
    return res.json(msg);
  } catch (error) {
    return next(error);
  }
});
module.exports = router;
