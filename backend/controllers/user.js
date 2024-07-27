const parentModel = require("../models/parent");
const kidModel = require("../models/kid");
const taskModel = require("../models/task");
const wishModel = require("../models/wish");
const kidNotificationModel = require("../models/notification/kid");
const parentNotificationModel = require("../models/notification/parent");

const bcrypt = require("bcrypt");
const moment = require("moment"); 

const saveParent = async (req, res) => {
  try {
    const kid = await kidModel.findOne({ username: req.body.username });
    if (kid) {
      throw new Error("Username existed!");
    }
    const profilePicture = req.body.profilePicture || "";

    const { username } = await parentModel.create({
      ...req.body,
      profilePicture,
    });
    res.status(200).send({ data: { username } });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const getKids = async (req, res) => {
  try {
    const parentId = req.session.userId;
    console.log(parentId);
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

    const profilePicture = req.body.profilePicture || "";

    const { username } = await kidModel.create({
      ...req.body,
      profilePicture,
    });

    res.status(200).send({ data: { username } });
  } catch (e) {
    console.log(e);
    res.status(400).send({ msg: e.message });
  }
};

const deleteKid = async (req, res) => {
  try {
    const kidId = req.params.id;

    // Check if the kid exists
    const kid = await kidModel.findById(kidId);
    if (!kid) {
      return res.status(404).send({ msg: "Kid not found" });
    }

    // Check if the kid belongs to the parent making the request
    const parentId = req.session.userId;
    if (kid.parent.toString() !== parentId) {
      return res.status(403).send({ msg: "Not authorized to delete this kid" });
    }

    // Delete the kid
    await kidModel.findByIdAndDelete(kidId);
    res.status(200).send({ msg: "Kid deleted successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    let object = null;
    let role = "parent";
    object = await parentModel.findOne({ username });
    if (!object) {
      object = await kidModel.findOne({ username });
      role = "kid";
    }
    if (object) {
      const same = await bcrypt.compare(password, object.password);
      if (same) {
        req.session.userId = object.id;
        if (role === "kid") {
          req.session.parentId = object.parent;
        }
        req.session.role = role;
        req.session.username = username;
        res.status(200).send({
          data: {
            username,
            id: object.id,
            role,
            profilePicture: object.profilePicture || "",
          },
        });
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
const createKidNotification = async (kid, content) => {
  return await kidNotificationModel.create({
    kid,
    content,
    created_at: new Date(),
  });
};
const createParentNotification = async (parent, content) => {
  return await parentNotificationModel.create({
    parent,
    content,
    created_at: new Date(),
  });
};

//task methods
const saveTask = async (req, res) => {
  try {
    const { parent, kid, taskDescription, taskCost, dueDate, recurrence } = req.body;

    if (!taskDescription || !taskCost || !dueDate || !kid) {
      throw new Error("All fields are required");
    }

    if (isNaN(taskCost) || taskCost <= 0) {
      throw new Error("Task cost must be a positive number");
    }

    const selectedDate = new Date(dueDate);
    const today = new Date();
    if (selectedDate <= today) {
      throw new Error("Due date must be in the future");
    }

    const parentDoc = await parentModel.findById(parent);
    if (!parentDoc) {
      throw new Error("Not a valid parent");
    }

    const kidDoc = await kidModel.findById(kid);
    if (!kidDoc || kidDoc.parent.toString() !== parentDoc.id.toString()) {
      throw new Error("Not a valid kid");
    }

    // Create the task
    const task = await taskModel.create({
      parent,
      kid,
      taskDescription,
      taskCost,
      dueDate,
      recurrence,
    });

    await createKidNotification(
      kid,
      `Your parent created new task for you: ${taskDescription}`
    );

    // Create recurring tasks
    if (recurrence && recurrence.frequency && recurrence.interval) {
      const { frequency, interval, daysOfWeek } = recurrence;
      let nextDate = moment(selectedDate);

      while (nextDate.isBefore(moment().add(1, 'year'))) {
        if (frequency === 'daily') {
          nextDate.add(interval, 'days');
        } else if (frequency === 'weekly') {
          nextDate.add(interval, 'weeks');
        } else if (frequency === 'monthly') {
          nextDate.add(interval, 'months');
        }

        if (nextDate.isAfter(moment().add(1, 'year'))) break;

        // Check if nextDate falls on one of the specified days of the week
        if (daysOfWeek && !daysOfWeek.includes(nextDate.day())) {
          continue;
        }

        await taskModel.create({
          parent,
          kid,
          taskDescription,
          taskCost,
          dueDate: nextDate.toDate(),
          recurrence,
        });

        // Notify the kid about each recurring task
        await createKidNotification(
          kid,
          `Recurring task created for you: ${taskDescription}, due on ${nextDate.format('YYYY-MM-DD')}`
        );
      }
    }

    res.status(200).send({ data: task });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getTasks = async (req, res) => {
  try {
    const parentId = req.session.userId;
    const tasks = await taskModel.find({ parent: parentId }).populate("kid");

    // Format the dueDate to remove time part
    const formattedTasks = tasks.map((task) => {
      return {
        ...task._doc,
        dueDate: task.dueDate.toISOString().split("T")[0],
        recurrence: task.recurrence || null,
      };
    });

    res.status(200).send({ data: formattedTasks });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getKidTasks = async (req, res) => {
  try {
    // const parentId = req.session.userId;
    const kidId = req.params.id;
    const tasks = await taskModel
      .find({ kid: kidId })
      .populate("kid")
      .sort({ createTime: -1 });

    // Format the dueDate to remove time part
    const formattedTasks = tasks.map((task) => {
      return {
        ...task._doc,
        dueDate: task.dueDate.toISOString().split("T")[0],
        recurrence: task.recurrence || null,
      };
    });

    res.status(200).send({ data: formattedTasks });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Check if the task exists
    const task = await taskModel.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    // Check if the task belongs to the parent making the request
    if (task.parent.toString() !== req.session.userId) {
      throw new Error("Not authorized to delete this task");
    }

    // Handle recurring tasks
    if (task.recurrence) {
      // Assuming you want to delete all tasks that are recurring based on this one
      await taskModel.deleteMany({
        parent: task.parent,
        kid: task.kid,
        taskDescription: task.taskDescription,
        createTime: { $gte: task.createTime }, // Delete all recurring tasks from the time this task was created
      });
    }

    // Delete the original task
    await taskModel.findByIdAndDelete(taskId);

    res.status(200).send({ msg: "Task deleted successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

//wish methods
const saveWish = async (req, res) => {
  try {
    const { kid, wishDescription, wishCost } = req.body;

    // Validate required fields
    if (!wishDescription || !wishCost || !kid) {
      throw new Error("All fields are required");
    }

    // Validate wishCost
    if (isNaN(wishCost) || wishCost <= 0) {
      throw new Error("Wish cost must be a positive number");
    }

    // Validate kid
    const kidDoc = await kidModel.findById(kid);
    if (!kidDoc) {
      throw new Error("Not a valid kid");
    }

    // Create the wish
    const wish = await wishModel.create({
      kid,
      wishDescription,
      wishCost,
      parent: kidDoc.parent,
    });
    res.status(200).send({ data: wish });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getWishes = async (req, res) => {
  try {
    const parentId = req.session.userId;
    const wishes = await wishModel
      .find({ parent: parentId })
      .populate("kid")
      .sort({ createTime: -1 });

    res.status(200).send({ data: wishes });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getParentWishes = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishes = await wishModel
      .find({ parent: userId })
      .populate("kid")
      .sort({ createTime: -1 });

    res.status(200).send({ data: wishes });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getKidWishes = async (req, res) => {
  try {
    const kidId = req.params.id;
    const wishes = await wishModel.find({ kid: kidId });

    res.status(200).send({ data: wishes });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const getNotifications = async (req, res) => {
  let notifications = [];
  try {
    if (req.session.role == "kid") {
      notifications = await kidNotificationModel.find({
        kid: req.session.userId,
      });
    } else {
      notifications = await parentNotificationModel.find({
        parent: req.session.userId,
      });
    }
    res.status(200).send({ data: notifications });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const deleteWish = async (req, res) => {
  try {
    const wishId = req.params.id;

    // Check if the wish exists
    const wish = await wishModel.findById(wishId);
    if (!wish) {
      return res.status(404).send({ msg: "Wish not found" });
    }

    // Check if the wish belongs to the kid making the request
    const kidId = req.body.kid;
    if (wish.kid.toString() !== kidId) {
      return res
        .status(403)
        .send({ msg: "Not authorized to delete this wish" });
    }

    // Delete the wish
    await wishModel.findByIdAndDelete(wishId);
    res.status(200).send({ msg: "Wish deleted successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};
const fulfillWish = async (req, res) => {
  try {
    const userId = req.session.userId;
    const wishId = req.params.id;

    // Check if the wish exists
    const wish = await wishModel.findById(wishId);
    if (!wish) {
      throw new Error("Wish not found");
    }

    console.log("wish: " + JSON.stringify(wish));
    console.log("user id:" + userId);
    // Check if the wish belongs to the kid making the request
    if (wish.kid.toString() !== userId && wish.parent.toString() !== userId) {
      return res
        .status(403)
        .send({ msg: "Not authorized to execute this wish" });
    }

    // TODO check if the coin in the kid's wallet is enough.
    // const kid = kidModel.findById(wish.kid)

    // Mark the wish as fulfilled
    wish.isFulfilled = true;
    await wish.save();
    await createParentNotification(
      req.session.parentId,
      `Your kid ${req.session.username} fullfilled a wish:${wish.wishDescription}`
    );

    res.status(200).send({ msg: "Wish fulfilled successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

module.exports = {
  "[POST] /login": login,
  "[POST] /signup": saveParent,
  "[POST] /kid": saveKid,
  "[GET] /kids": getKids,
  "[DELETE] /kid/:id": deleteKid,
  "[POST] /task": saveTask,
  "[GET] /tasks": getTasks,
  "[GET] /kidTasks/:id": getKidTasks,
  "[DELETE] /task/:id": deleteTask,
  "[GET] /kidWishes/:id": getKidWishes,
  "[POST] /wish": saveWish,
  "[GET] /wishes": getWishes,
  "[GET] /parentWishes": getParentWishes,
  "[DELETE] /wish/:id": deleteWish,
  "[POST] /wish/fulfill/:id": fulfillWish,
  "[GET] /logout": logout,
  "[GET] /notification": getNotifications,
};
