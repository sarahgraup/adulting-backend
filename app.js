"use strict";

/** Express app for Adulting. */

const express = require("express");
const cors = require("cors");
const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const usersRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

// const S3 = require('aws-sdk/clients/s3');

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/users", usersRoutes);
app.use("/auth", authRoutes);
app.use(function (req, res, next) {
    throw new NotFoundError();
  });

/** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;
  
    return res.status(status).json({
      error: { message, status },
    });
  });

  module.exports = app;