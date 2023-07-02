"use strict";

const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
const db = require("../db.js");
const User = require("./user.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** authenticate */

/**
 * authenticate user can sign in
 * user cant sign in unauth no such user
 * unauth wrong password
 * register: can register
 * register bad request with dup username
 * register cant with not email
 * get specific user works
 * get user not found if no such user
 * can update password
 * can update username
 * cant update username with dupe
 *can update password
 cant update password if same as last password
 remove:can remove user
 
 


 */