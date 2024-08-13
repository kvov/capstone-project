const parentModel = require("../models/parent");
const kidModel = require("../models/kid");
const taskModel = require("../models/task");
const wishModel = require("../models/wish");
const kidNotificationModel = require("../models/notification/kid");
const parentNotificationModel = require("../models/notification/parent");

const bcrypt = require("bcrypt");
const cron = require("node-cron");
const moment = require("moment-timezone");

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

const saveParent = async (req, res) => {
  const _username = req.body.username.toLocaleLowerCase();
  try {
    const kid = await kidModel.findOne({ username: _username });
    if (kid) {
      throw new Error("Username existed!");
    }
    const profilePicture = req.body.profilePicture || "";

    const { username } = await parentModel.create({
      ...req.body,
      username: _username,
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
  const _username = req.body.username;
  try {
    const parentWithSameUsername = await parentModel.findOne({
      username: _username,
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
      username: _username,
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

const getKidDetails = async (req, res) => {
  try {
    const kidId = req.params.id;

    const kid = await kidModel.findById(kidId);

    if (!kid) {
      return res.status(404).send({ msg: "Kid not found" });
    }

    const parentId = req.session.userId;
    if (kid.parent.toString() !== parentId) {
      return res
        .status(403)
        .send({ msg: "Not authorized to access this kid's details" });
    }
    res.status(200).send({ data: kid });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { username: _username, password } = req.body;
    const username = _username.toLocaleLowerCase();
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

const saveTask = async (req, res) => {
  try {
    const { parent, kid, taskDescription, taskCost, dueDate, recurrence } =
      req.body;

    if (!taskDescription || !taskCost || !dueDate || !kid) {
      throw new Error("All fields are required");
    }

    if (isNaN(taskCost) || taskCost <= 0) {
      throw new Error("Task cost must be a positive number");
    }

    const selectedDate = moment
      .tz(dueDate, "America/Toronto")
      .startOf("day")
      .toDate();
    const today = moment.tz("America/Toronto").startOf("day").toDate();

    if (selectedDate < today) {
      throw new Error("Due date must be today or in the future");
    }

    const parentDoc = await parentModel.findById(parent);
    if (!parentDoc) {
      throw new Error("Not a valid parent");
    }

    const kidDoc = await kidModel.findById(kid);
    if (!kidDoc || kidDoc.parent.toString() !== parentDoc.id.toString()) {
      throw new Error("Not a valid kid");
    }

    // Create a new task
    const task = await taskModel.create({
      parent,
      kid,
      taskDescription,
      taskStatus: "new",
      taskCost,
      dueDate: selectedDate,
      recurrence,
    });

    await createKidNotification(
      kid,
      `New task created for you: ${taskDescription}`
    );

    // Create recurring tasks
    if (recurrence && recurrence.frequency) {
      const { frequency, daysOfWeek } = recurrence;
      let nextDate = moment(selectedDate);

      while (nextDate.isBefore(moment().add(1, "year"))) {
        if (frequency === "daily") {
          nextDate.add(1, "days");
        } else if (frequency === "weekly") {
          nextDate.add(1, "weeks");
        } else if (frequency === "monthly") {
          nextDate.add(1, "months");
        }

        if (nextDate.isAfter(moment().add(1, "year"))) break;

        if (daysOfWeek && !daysOfWeek.includes(nextDate.day())) {
          continue;
        }

        // Create a new recurring task with the updated due date
        await taskModel.create({
          parent,
          kid,
          taskDescription,
          taskStatus: "new",
          taskCost,
          dueDate: nextDate.toDate(),
          recurrence,
        });
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

    const formattedTasks = tasks.map((task) => {
      const formattedDueDate = moment
        .tz(task.dueDate, "America/Toronto")
        .format("YYYY-MM-DD");
      return {
        ...task._doc,
        dueDate: formattedDueDate,
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
    const kidId = req.params.id;
    console.log(kidId);
    const tasks = await taskModel
      .find({ kid: kidId })
      .populate("kid")
      .sort({ createTime: -1 });

    // Format the dueDate to remove time part
    const formattedTasks = tasks.map((task) => {
      const formattedDueDate = moment
        .tz(task.dueDate, "America/Toronto")
        .format("YYYY-MM-DD");
      return {
        ...task._doc,
        dueDate: formattedDueDate,
        recurrence: task.recurrence || null,
      };
    });

    res.status(200).send({ data: formattedTasks });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const taskId = req.params.id;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({ msg: "Task not found" });
    }

    if (task.kid.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({ msg: "Not authorized to complete this task" });
    }

    task.taskStatus = "pending approval";
    await task.save();

    await createParentNotification(
      req.session.parentId,
      `Your kid ${req.session.username} completed the task: ${task.taskDescription}`
    );

    res.status(200).send({ msg: "Task marked as completed" });
  } catch (e) {
    res.status(500).send({ msg: "An error occurred", e });
  }
};

const failTask = async (req, res) => {
  try {
    const userId = req.session.userId;
    const taskId = req.params.id;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({ msg: "Task not found" });
    }

    if (task.kid.toString() !== userId.toString()) {
      return res
        .status(403)
        .send({ msg: "Not authorized to complete this task" });
    }

    task.taskStatus = "failed";
    await task.save();

    await createParentNotification(
      req.session.parentId,
      `Your kid ${req.session.username} failed to complete the task: ${task.taskDescription}`
    );

    res.status(200).send({ msg: "Task marked as completed" });
  } catch (e) {
    res.status(500).send({ msg: "An error occurred", e });
  }
};

const confirmTask = async (req, res) => {
  try {
    const parentId = req.session.userId;
    const taskId = req.params.id;
    const { recurrence, taskCost, kidId } = req.body;

    const task = await taskModel.findById(taskId);
    if (!task) {
      return res.status(404).send({ msg: "Task not found" });
    }

    if (task.kid.toString() !== kidId.toString()) {
      return res
        .status(403)
        .send({ msg: "Not authorized to complete this task" });
    }

    if (!recurrence.frequency && !recurrence.daysOfWeek?.length) {
      // No recurrence, mark task as completed
      task.taskStatus = "completed";
    } else {
      // Recurrence present, mark task as in progress
      task.taskStatus = "in progress";
    }
    await task.save();

    // Update kid's wallet with taskCost
    const kid = await kidModel.findById(kidId);
    if (!kid) {
      return res.status(404).send({ msg: "Kid not found" });
    }
    kid.wallet += taskCost;
    await kid.save();

    // Send notification to the kid
    await createKidNotification(
      kidId,
      `Completion of the task "${task.taskDescription}" has been confirmed by your parent.`
    );

    res.status(200).send({ msg: "Task status updated successfully", taskCost });
  } catch (e) {
    res.status(500).send({ msg: "An error occurred", e });
  }
};

const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { taskDescription, taskStatus, taskCost, dueDate, recurrence } =
      req.body;

    const task = await taskModel.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    if (task.parent.toString() !== req.session.userId) {
      throw new Error("Not authorized to update this task");
    }

    // Update task details
    task.taskDescription = taskDescription || task.taskDescription;
    task.taskStatus = taskStatus || task.taskStatus;
    task.taskCost = taskCost || task.taskCost;
    task.dueDate = dueDate || task.dueDate;
    task.recurrence = recurrence || task.recurrence;

    const todayStart = moment.tz("America/Toronto").startOf("day");
    const todayEnd = moment.tz("America/Toronto").endOf("day");
    const taskDueDate = moment
      .tz(task.dueDate, "America/Toronto")
      .startOf("day");

    if (
      taskDueDate.isBefore(todayEnd) &&
      taskDueDate.isAfter(todayStart) &&
      task.taskStatus !== "completed"
    ) {
      task.taskStatus = "expired";
      console.log("Task marked as expired");
    }
    await task.save();

    // Notify parent and kid
    await createParentNotification(
      task.parent,
      `Task "${task.taskDescription}" was updated.`
    );
    await createKidNotification(
      task.kid,
      `Task "${task.taskDescription}" was updated.`
    );

    res.status(200).send({ msg: "Task updated successfully", data: task });
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
      await taskModel.deleteMany({
        parent: task.parent,
        kid: task.kid,
        taskDescription: task.taskDescription,
        createTime: { $gte: task.createTime },
      });
    }

    // Delete the original task
    await taskModel.findByIdAndDelete(taskId);

    res.status(200).send({ msg: "Task deleted successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

// Function to send notifications for upcoming tasks
const sendTaskReminders = async () => {
  try {
    // Get current date and time in the desired time zone
    const now = moment.tz("America/Toronto");
    const endOfDay = now.clone().add(24, "hours");

    // Find tasks that are due within the next 24 hours
    const tasks = await taskModel
      .find({
        dueDate: { $gte: now.toDate(), $lte: endOfDay.toDate() },
        taskStatus: { $nin: ["completed", "pending approval"] },
        reminderSent: { $lt: now.subtract(1, "hour").toDate() },
      })
      .populate("kid");

    for (const task of tasks) {
      // Send notification to the kid
      await createKidNotification(
        task.kid._id,
        `Reminder: The task "${task.taskDescription}" is due soon. Please make sure to complete it before the due date.`
      );

      // Update task to record reminder sent time
      await taskModel.updateOne(
        { _id: task._id },
        { reminderSent: now.toDate() }
      );
    }
  } catch (error) {
    console.error("Error sending task reminders:", error);
  }
};

// Schedule the job to run every hour
cron.schedule("0 * * * *", sendTaskReminders);

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

    // Check if the wish belongs to the kid making the request
    if (wish.kid.toString() !== userId && wish.parent.toString() !== userId) {
      return res
        .status(403)
        .send({ msg: "Not authorized to execute this wish" });
    }

    // Check the wallet balance
    const kid = await kidModel.findById(userId);
    if (kid.wallet < wish.wishCost) {
      return res.status(400).send({ msg: "Insufficient coins in wallet" });
    }

    kid.wallet -= wish.wishCost;
    await kid.save();

    wish.isFulfilled = true;
    await wish.save();

    await createParentNotification(
      req.session.parentId,
      `Your kid ${req.session.username} fullfilled the wish: ${wish.wishDescription}`
    );

    res.status(200).send({ msg: "Wish fulfilled successfully" });
  } catch (e) {
    res.status(400).send({ msg: e.message });
  }
};

const getKidWallet = async (req, res) => {
  try {
    const kidId = req.params.id;

    // Find the kid by ID
    const kid = await kidModel.findById(kidId);
    if (!kid) {
      return res.status(404).send({ msg: "Kid not found" });
    }

    // Respond with wallet data
    res.status(200).send({ wallet: kid.wallet });
  } catch (e) {
    res.status(500).send({ msg: "An error occurred", e });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    // Assuming the notificationId can be either from a kid or a parent notification
    const result =
      (await kidNotificationModel.findByIdAndDelete(notificationId)) ||
      (await parentNotificationModel.findByIdAndDelete(notificationId));

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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

const countNotifications = async (req, res) => {
  let notifications = [];
  try {
    if (req.session.role === "kid") {
      notifications = await kidNotificationModel.find({
        kid: req.session.userId,
      });
    } else {
      notifications = await parentNotificationModel.find({
        parent: req.session.userId,
      });
    }

    // Count unread notifications
    const unreadCount = notifications.filter(
      (notification) => notification.status === "unread"
    ).length;

    res.status(200).send({ count: unreadCount });
  } catch (e) {
    res.status(500).send({ msg: "An error occurred", e });
  }
};

const readNotifications = async (req, res) => {
  try {
    const userId = req.session.userId;
    const role = req.session.role;

    let result;
    if (role === "kid") {
      result = await kidNotificationModel.updateMany(
        { kid: userId, status: "unread" },
        { $set: { status: "read" } }
      );
    } else if (role === "parent") {
      result = await parentNotificationModel.updateMany(
        { parent: userId, status: "unread" },
        { $set: { status: "read" } }
      );
    } else {
      return res.status(403).send({ msg: "Unauthorized user" });
    }

    res.status(200).send({
      msg: "Notifications marked as read",
      modifiedCount: result.nModified,
    });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .send({ msg: "An error occurred while updating notifications", e });
  }
};

module.exports = {
  "[POST] /login": login,
  "[POST] /signup": saveParent,
  "[POST] /kid": saveKid,
  "[GET] /kids": getKids,
  "[GET] /kidDetails/:id": getKidDetails,
  "[DELETE] /kid/:id": deleteKid,
  "[POST] /task": saveTask,
  "[GET] /tasks": getTasks,
  "[GET] /kidTasks/:id": getKidTasks,
  "[DELETE] /task/:id": deleteTask,
  "[PUT] /task/complete/:id": completeTask,
  "[PUT] /task/fail/:id": failTask,
  "[PUT] /task/confirm/:id": confirmTask,
  "[PUT] /task/:id": updateTask,
  "[GET] /kidWishes/:id": getKidWishes,
  "[POST] /wish": saveWish,
  "[GET] /wishes": getWishes,
  "[GET] /parentWishes": getParentWishes,
  "[DELETE] /wish/:id": deleteWish,
  "[PUT] /wish/fulfill/:id": fulfillWish,
  "[GET] /logout": logout,
  "[GET] /notification": getNotifications,
  "[GET] /notification/count": countNotifications,
  "[PUT] /notification/read": readNotifications,
  "[DELETE] /notification/:notificationId": deleteNotification,
  "[GET] /kidWallet/:id": getKidWallet,
};
