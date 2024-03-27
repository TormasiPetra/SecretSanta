import express from "express";
import cors from "cors";
import { z } from "zod";
import fs from "fs/promises";

import { save, load } from "./util";

const app = express();

app.use(cors());
app.use(express.json());

//--------------
type User = {
  id: number;
  isAdmin: boolean;
  name: string;
  email: string;
};

type Group = {
  id: number;
  groupname: string;
  users: User[];
};
//-----------------
const UserSchema = z.object({
  id: z.number(),
  isAdmin: z.boolean(),
  name: z.string(),
  email: z.string().email(),
});

const Groupschema = z.object({
  id: z.number(),
  groupname: z.string(),
  users: UserSchema.array(),
});

const IncomingSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

//----------------------


// joining a group
app.post("/api/join/:groupid");

const QueryParams = z.object({
  groupname: z.string(),
  username: z.string(),
  email: z.string(),
});
 
// to see if the name is already taken
app.post("/api/groups", async (req, res) => {

  const result = QueryParams.safeParse(req.query)
  if (!result.success)
    return res.status(400).json(result.error.issues)
  const queryParams = result.data

  const groups: Group = await load("groups");
  if (!groups) return res.sendStatus(500);

  let id = 1
  
  console.log(groups)

  res.json({id})
});

// creating a group/signup
app.post("/api/groupsignup");

// checking your group
app.get("/api/group/:groupid", async (req, res) => {});

app.get("/api/santa/:userid");


app.listen(3000)