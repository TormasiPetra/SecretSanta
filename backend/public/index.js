"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const hash_1 = require("./util/hash");
const util_1 = require("./util");
const app = (0, express_1.default)();
const serverPassword = "ksjfbnsdjkfbdsjkfbkjb";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//-----------------
const UserSchema = zod_1.z.object({
    id: zod_1.z.number(),
    username: zod_1.z.string(),
    password: zod_1.z.string(),
});
const GroupSchema = zod_1.z.object({
    id: zod_1.z.number(),
    groupname: zod_1.z.string(),
    budget: zod_1.z.number(),
    finishDate: zod_1.z.string(),
    admin: UserSchema.nullable(),
    users: zod_1.z
        .object({
        user: UserSchema,
        alreadyDrawn: zod_1.z.boolean().default(false),
        alreadyTaken: zod_1.z.boolean().default(false),
    })
        .array(),
    alreadyDrawnUsers: zod_1.z
        .object({
        user: UserSchema,
        santa: UserSchema,
    })
        .array(),
    isActive: zod_1.z.boolean().default(false),
    isFinished: zod_1.z.boolean().default(false),
    drawStarted: zod_1.z.boolean().default(false),
});
//----------------------
const SignupRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(3),
});
app.post("/api/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = SignupRequestSchema.safeParse(req.body);
    if (!result.success)
        return res.sendStatus(400);
    const { username, password } = result.data;
    const users = yield (0, util_1.load)("users", UserSchema.array());
    if (!users)
        return res.sendStatus(500);
    const userExists = users.some((user) => user.username === username);
    if (userExists)
        return res.sendStatus(409);
    const id = Math.random();
    const hashedPassword = yield (0, hash_1.hash)(password);
    users.push({ id, username, password: hashedPassword });
    const isCreated = yield (0, util_1.save)("users", users, UserSchema.array());
    if (!isCreated)
        return res.sendStatus(500);
    return res.json({ id });
}));
const LoginRequestSchema = zod_1.z.object({
    username: zod_1.z.string().min(3),
    password: zod_1.z.string().min(3),
});
app.post("/api/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = LoginRequestSchema.safeParse(req.body);
    if (!result.success)
        return res.sendStatus(400);
    const { username, password } = result.data;
    const users = yield (0, util_1.load)("users", UserSchema.array());
    if (!users)
        return res.sendStatus(500);
    const user = users.find((user) => user.username === username);
    if (!user)
        return res.sendStatus(401);
    const isCorrect = yield (0, hash_1.compare)(password, user.password);
    if (!isCorrect)
        return res.sendStatus(401);
    const token = jsonwebtoken_1.default.sign({ username: user.username }, serverPassword);
    return res.json({ token });
}));
const Headers = zod_1.z.object({
    auth: zod_1.z.string(),
});
const safeVerify = (token, schema) => {
    try {
        const tokenPayload = jsonwebtoken_1.default.verify(token, serverPassword);
        return schema.parse(tokenPayload);
    }
    catch (error) {
        return null;
    }
};
app.use((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const result = Headers.safeParse(req.headers);
    if (!result.success)
        return next();
    const { auth } = result.data;
    if (!auth)
        return next();
    const tokenPayload = safeVerify(auth, zod_1.z.object({ username: zod_1.z.string() }));
    if (!tokenPayload)
        return next();
    const users = yield (0, util_1.load)("users", UserSchema.omit({ password: true }).array());
    if (!users)
        return res.sendStatus(500);
    const user = users.find((user) => user.username === tokenPayload.username);
    if (!user)
        return next();
    res.locals.user = user;
    next();
}));
app.get("/api/init", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const groupsOfUser = groups
        .filter((group) => group.users.some((player) => player.user.username === user.username))
        .map((group) => group);
    res.json({
        username: user.username,
        groupsOfUser,
    });
}));
const AuthorizeRequest = zod_1.z.object({
    groupIds: zod_1.z.number(),
    userId: zod_1.z.number(),
});
/* app.post("/api/authorize", async (req, res) => {
  const user = res.locals.user as Omit<User, 'password'>
  if (!user)
    return res.sendStatus(401)

  const result = AuthorizeRequest.safeParse(req.body)
  if (!result.success)
    return res.sendStatus(400)

  const games = await load("games", GameSchema.array())
  if (!games)
    return res.sendStatus(500)

  const id = result.data.gameId
  const gameToUpdate = games.find(game => game.id === +id)
  if (!gameToUpdate)
    return res.sendStatus(404)

  if (gameToUpdate.admin !== user.name)
    return res.sendStatus(403)

  const userId = result.data.userId
  const userToAuth = gameToUpdate.requests.find(player => player.id === userId)
  if (!userToAuth)
    return res.sendStatus(400)

  gameToUpdate.requests = gameToUpdate.requests.filter(player => player.id !== userId)
  gameToUpdate.joinedUsers.push(userToAuth)

  const saveResult = await save("games", games
    .map(game => game.id === id ? gameToUpdate : game), GameSchema.array())

  if (!saveResult.success)
    return res.sendStatus(500)

  res.json(saveResult)
})
*/
const JoinSchema = zod_1.z.object({
    groupname: zod_1.z.string(),
});
// joining a group
app.post("/api/join/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = JoinSchema.safeParse(req.body);
    if (!result.success) {
        return res.sendStatus(400);
    }
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const { groupname } = result.data;
    const username = req.params.username;
    if (username !== user.username)
        return res.sendStatus(401);
    const users = yield (0, util_1.load)("users", UserSchema.array());
    if (!users)
        return res.sendStatus(500);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const currentUser = users.find((user) => user.username === username);
    if (!currentUser) {
        return res.sendStatus(401);
    }
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    const isUserInGroup = currentGroup.users.some((user) => user.user.username === currentUser.username);
    if (isUserInGroup) {
        return res.sendStatus(409);
    }
    if (currentGroup.admin) {
        const isUserAdminInGroup = currentGroup.admin.username === currentUser.username;
        if (isUserAdminInGroup) {
            return res.sendStatus(409);
        }
    }
    if (currentGroup.isActive) {
        return res.sendStatus(409);
    }
    const newUser = {
        user: currentUser,
        alreadyDrawn: false,
        alreadyTaken: false,
    };
    currentGroup.users.push(newUser);
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    if (!saveResult.success)
        return res.sendStatus(500);
    res.json(currentGroup);
}));
const CreateSchema = zod_1.z.object({
    groupname: zod_1.z.string(),
    budget: zod_1.z.coerce.number(),
    finishDate: zod_1.z.string(),
});
app.post("/api/create/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const result = CreateSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400);
    }
    const username = req.params.username;
    const { groupname, budget, finishDate } = result.data;
    const users = yield (0, util_1.load)("users", UserSchema.array());
    if (!users)
        return res.sendStatus(500);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const userExists = users.some((user) => user.username === username);
    if (!userExists) {
        return res.sendStatus(404);
    }
    const groupExists = groups.some((group) => group.groupname === groupname);
    if (groupExists) {
        return res.sendStatus(409);
    }
    const thisUser = users.find((user) => user.username === username);
    if (!thisUser)
        return res.sendStatus(401);
    const groupId = Math.random();
    const newGroup = {
        id: groupId,
        groupname,
        budget,
        finishDate,
        users: [],
        alreadyDrawnUsers: [],
        admin: null,
        isActive: false,
        drawStarted: false,
        isFinished: false,
    };
    newGroup.admin = thisUser;
    const newUser = {
        user: thisUser,
        alreadyDrawn: false,
        alreadyTaken: false,
    };
    newGroup.users.push(newUser);
    groups.push(newGroup);
    /* const saveUserResult = await save("users", users, UserSchema.array());
    if (!saveUserResult.success) return res.sendStatus(500); */
    const saveGroupResult = yield (0, util_1.save)("groups", groups, GroupSchema.array());
    if (!saveGroupResult.success)
        return res.sendStatus(500);
    res.json(newGroup);
}));
//----------------------
app.post("/api/start/:groupname", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const groupname = req.params.groupname;
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    if (currentGroup.admin === null) {
        return res.sendStatus(404);
    }
    if (user.username !== currentGroup.admin.username) {
        return res.sendStatus(401);
    }
    if (currentGroup.isActive) {
        return res.sendStatus(409);
    }
    currentGroup.isActive = true;
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    if (!saveResult.success)
        return res.sendStatus(500);
    res.json(currentGroup);
    //sets isActive to true, allowing ppl to draw names
}));
app.post("/api/stop/:groupname", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const groupname = req.params.groupname;
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    if (currentGroup.admin === null) {
        return res.sendStatus(404);
    }
    if (user.username !== currentGroup.admin.username) {
        return res.sendStatus(401);
    }
    if (currentGroup.drawStarted) {
        return res.sendStatus(409);
    }
    if (!currentGroup.isActive) {
        return res.sendStatus(409);
    }
    currentGroup.isActive = false;
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    if (!saveResult.success)
        return res.sendStatus(500);
    res.json(currentGroup);
    //setting isActive to false
}));
const editRequestSchema = zod_1.z.object({
    editedUsername: zod_1.z.string(),
});
app.patch("/api/edit/:groupname/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const result = editRequestSchema.safeParse(req.body);
    if (!result.success) {
        return res.sendStatus(400);
    }
    const editedUsername = result.data.editedUsername;
    const { groupname, username } = req.params;
    if (user.username !== username)
        return res.sendStatus(401);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const users = yield (0, util_1.load)("users", UserSchema.array());
    if (!users)
        return res.sendStatus(500);
    const currentUser = users.find((user) => user.username === username);
    if (!currentUser) {
        return res.sendStatus(404);
    }
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    const userToEditInGroup = currentGroup.users.find((user) => user.user.username === username);
    if (!userToEditInGroup) {
        return res.sendStatus(404);
    }
    userToEditInGroup.user.username = editedUsername;
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    if (!saveResult.success)
        return res.sendStatus(500);
    res.json(currentGroup);
    //név szerkesztésének lehetősége
}));
app.delete("/api/delete/:groupname/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const { groupname, username } = req.params;
    if (username === user.username)
        res.sendStatus(409);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    if (currentGroup.drawStarted)
        return res.sendStatus(409);
    if (currentGroup.admin === null) {
        return res.sendStatus(404);
    }
    if (user.username !== currentGroup.admin.username) {
        return res.sendStatus(401);
    }
    const userTakeOut = currentGroup.users.filter((user) => user.user.username !== username);
    currentGroup.users = userTakeOut;
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    res.json(currentGroup);
    //név törlése a listából
}));
app.post("/api/draw/:groupname/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const { groupname, username } = req.params;
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    if (username !== user.username)
        return res.sendStatus(401);
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    if (currentGroup.isActive === false)
        return res.sendStatus(409);
    const userDrawing = currentGroup.users.find((user) => user.user.username === username);
    if (!userDrawing) {
        return res.sendStatus(404);
    }
    if (userDrawing.alreadyDrawn)
        return res.sendStatus(409);
    userDrawing.alreadyDrawn = true;
    const usersToChooseFrom = currentGroup.users.filter((user) => user.alreadyTaken === false && user.user.username !== username);
    const chosenUser = usersToChooseFrom[Math.floor(Math.random() * usersToChooseFrom.length)];
    chosenUser.alreadyTaken = true;
    const newAlreadyDrawnUser = {
        user: userDrawing.user,
        santa: chosenUser.user,
    };
    currentGroup.users.map((user) => {
        if (user.user.username === chosenUser.user.username) {
            user.alreadyTaken = true;
        }
    });
    currentGroup.alreadyDrawnUsers.push(newAlreadyDrawnUser);
    if (!currentGroup.drawStarted) {
        currentGroup.drawStarted = true;
    }
    if (currentGroup.users.length === currentGroup.alreadyDrawnUsers.length) {
        currentGroup.isFinished = true;
    }
    const saveResult = yield (0, util_1.save)("groups", groups.map((group) => group.groupname === groupname ? currentGroup : group), GroupSchema.array());
    if (!saveResult.success)
        return res.sendStatus(500);
    res.json({ currentGroup: currentGroup,
        chosenUser: chosenUser.user });
    //takes out the name from group.users and putting it to the list of drawnUsers
}));
app.delete("/api/deleteGroup/:groupname/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = res.locals.user;
    if (!user)
        return res.sendStatus(401);
    const { groupname, username } = req.params;
    if (username !== user.username)
        res.sendStatus(401);
    const groups = yield (0, util_1.load)("groups", GroupSchema.array());
    if (!groups)
        return res.sendStatus(500);
    const currentGroup = groups.find((group) => group.groupname === groupname);
    if (!currentGroup) {
        return res.sendStatus(404);
    }
    if (currentGroup.admin === null) {
        return res.sendStatus(404);
    }
    if (user.username !== currentGroup.admin.username) {
        return res.sendStatus(401);
    }
    const filteredGroups = groups.filter((group) => group.groupname !== groupname);
    const saveResult = yield (0, util_1.save)("groups", filteredGroups, GroupSchema.array());
    res.json({ result: saveResult });
    //név törlése a listából
}));
// creating a group/signup
app.post("/api/groupsignup");
// checking your group
app.get("/api/group/:groupid", (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
app.get("/api/santa/:userid");
app.listen(3000);
