const parentModel = require("../models/parent");
const kidModel = require("../models/kid");

const bcrypt = require("bcrypt");

const saveParent = async (req, res) => {
  try {
    const kid = await kidModel.findOne({ username: req.body.username });
    if (kid) {
      throw new Error("Username existed!");
    }
    const { username } = await parentModel.create(req.body);
    res.status(200).send({ data: { username } });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const getKids = async (req, res) => {
  try {
    const parentId = req.session.userId;
    const kids = await kidModel.find({ parent: parentId });
    res.status(200).send({ data: kids });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const saveKid = async (req, res) => {
  try {
    const parentWithSameUsername = await parentModel.findOne({
      username: req.body.username,
    });
    if (parentWithSameUsername) {
      throw new Error("Username existed!");
    }
    const parent = await parentModel.findById(req.body.parent);
    if (!parent) {
      throw new Error("Not a valid parent");
    }
    const { username } = await kidModel.create(req.body);
    res.status(200).send({ data: { username } });
  } catch (e) {
    console.log(e);
    res.status(400).send({ msg: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    let object = null;
    object = await parentModel.findOne({ username });
    if (!object) {
      object = await kidModel.findOne({ username });
    }
    if (object) {
      const same = await bcrypt.compare(password, object.password);
      if (same) {
        req.session.userId = object.id;
        res.status(200).send({ data: { username } });
      } else {
        throw new Error("Wrong password");
      }
    } else {
      throw new Error("User not exist");
    }
  } catch (e) {
    console.log(e);
    res.status(400).send({ msg: "Username do not exist or wrong password" });
  }
};
const logout = async (req, res) => {
  try {
    req.session.destroy();
    res.status(200).send({ msg: "success" });
  } catch (e) {
    res.status(400).send({ msg: e });
  }
};

module.exports = {
  "[POST] /login": login,
  "[POST] /signup": saveParent,
  "[POST] /kid": saveKid,
  "[GET] /kids": getKids,
  "[GET] /logout": logout,
};
