"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {
    ensureLoggedIn,
    ensureSameUser
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const userUpdateSchema = require("../../schemas/userUpdate.json");

const router = express.Router();


/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: login
 **/

// router.get("/",
// ensureLoggedIn,
//   async function (req, res, next) {
//     const users = await User.findAll();
//     return res.json({ users });
//   });


/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin }
 *
 * Authorization required: login
 **/

router.get("/:username",
    ensureLoggedIn,
    async function (req, res, next) {
        const user = await User.get(req.params.username);
        return res.json({ user });
    });


/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email}
 *
 * Authorization required: login, same user
 **/

router.patch("/:username",
    ensureLoggedIn,
    ensureSameUser,
    async function (req, res, next) {
        const validator = jsonschema.validate(
            req.body,
            userUpdateSchema,
            { required: true }
        );
        if (!validator.valid) {
            const errs = validator.errors.map(e => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    });


/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: login and same user
 **/

router.delete("/:username",
    ensureLoggedIn,
    ensureSameUser,
    async function (req, res, next) {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    });

/** GET /[username]/posts => { posts }
*
* Returns { id, title, username, description, date }
*
* Authorization required: login
**/
router.get("/:username/posts",
    ensureLoggedIn,
    async function (req, res, next) {
        const posts = await User.userPosts(req.params.username);
        return res.json({ posts });
    });

/** GET /[username]/likes => { likes }
 *
 * Returns { id, username, title, description, date, user }
 *
 * Authorization required: login
 **/
router.get("/:username/likes",
    ensureLoggedIn,
    async function (req, res, next) {
        const likes = await User.userLikes(req.params.username);
        return res.json({ likes });
    });

/** POST /[username]/follow => { follower }
 *
 * Returns { user_following_id, user_being_followed_id }
 *
 * Authorization required: login
 **/
router.post("/:username/follow",
    ensureLoggedIn,
    async function (req, res, next) {
        const follower = await User.addFollow(req.params.username, req.body.userBeingFollowedId);
        return res.json({ follower });
    });


/** DELETE /[username]/follow => { removedFollower }
 *
 * Returns { user_following_id, user_being_followed_id }
 *
 * Authorization required: login
 **/
router.delete("/:username/follow",
    ensureLoggedIn,
    async function (req, res, next) {
        const removedFollower = await User.removeFollow(req.params.username, req.body.userBeingFollowedId);
        return res.json({ removedFollower });
    });




module.exports = router;