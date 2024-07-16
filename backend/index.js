require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const db = require("./db");
const bootControllers = require("./bootControllers");
const session = require("express-session");

const frontendDirRelative = "../frontend";
const frontendDir = path.resolve(__dirname, `${frontendDirRelative}`);
const htmlDir = path.resolve(__dirname, `${frontendDirRelative}/html`);
const init = async () => {
  try {
    await db();

    const app = new express();
    // app.use(express.json());
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));
    app.use(
      session({
        secret: "your-secret-key",
        resave: false,
        saveUninitialized: true,
      })
    );
    // app.use(express.static(frontendDir));
    // app.use(express.urlencoded());
    // fs.readdirSync(htmlDir)
    //   .filter((file) => file.endsWith(".html"))
    //   .forEach((file) => {
    //     const url = file.split(".")[0];
    //     app.get(`/${url == "index" ? "" : url}`, (req, res) => {
    //       res.sendFile(file, { root: htmlDir });
    //     });
    //   });
    //boot api controllers
    bootControllers(app);
    // listen 4000 port
    app.listen(4000, () => {
      console.log("App listening on port 4000 : http//localhost:4000");
    });
  } catch (e) {
    console.log(e);
  }
};

init();
