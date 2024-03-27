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
const util_1 = require("./util");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//-----------------
const UserSchema = zod_1.z.object({
    id: zod_1.z.number(),
    isAdmin: zod_1.z.boolean(),
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
});
const Groupschema = zod_1.z.object({
    id: zod_1.z.number(),
    groupname: zod_1.z.string(),
    users: UserSchema.array(),
});
const IncomingSchema = zod_1.z.object({
    name: zod_1.z.string(),
    email: zod_1.z.string().email(),
});
//----------------------
// joining a group
app.post("/api/join/:groupid");
const QueryParams = zod_1.z.object({
    groupname: zod_1.z.string(),
    username: zod_1.z.string(),
    email: zod_1.z.string(),
});
// to see if the name is already taken
app.post("/api/groups", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = QueryParams.safeParse(req.query);
    if (!result.success)
        return res.status(400).json(result.error.issues);
    const queryParams = result.data;
    const groups = yield (0, util_1.load)("groups");
    if (!groups)
        return res.sendStatus(500);
    let id = 1;
    /* const filterGroups = groups.map(group => group.name > queryParams.after) */
    console.log(groups);
    res.json({ id });
}));
// creating a group/signup
app.post("/api/groupsignup");
// checking your group
app.get("/api/group/:groupid", (req, res) => __awaiter(void 0, void 0, void 0, function* () { }));
app.get("/api/santa/:userid");
app.listen(3000);
