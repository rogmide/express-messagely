/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/


/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
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
 
 router.get("/", async (req, res, next) => {
   try {
     res.send("Users Route");
   } catch (error) {
     next(error);
   }
 });
 
 
 module.exports = router;