import { z } from "zod";
import { safeFetch } from "../lib/safefetch";
import { UserSchema, GroupSchema } from "../model";

export const joinGroup = (groupname: string, username: string | null) =>
  safeFetch({
    method: "POST",
    url: `/api/join/${username}`,
    schema: GroupSchema,
    payload: { groupname },
  });

export const login = (username: string, password: string) =>
  safeFetch({
    method: "POST",
    url: "/api/login",
    schema: z.object({ token: z.string() }),
    payload: { username, password },
  });

export const signup = (username: string, password: string) =>
  safeFetch({
    method: "POST",
    url: "/api/signup",
    schema: z.object({ id: z.number() }),
    payload: { username, password },
  });

export const create = (
  username: string | null,
  groupname: string,
  budget: number | null,
  finishDate: string | null
) =>
  safeFetch({
    method: "POST",
    url: `/api/create/${username}`,
    schema: z.object({ id: z.number() }),
    payload: { groupname, budget, finishDate },
  });

export const authorize = (groupIds: number, userId: number) =>
  safeFetch({
    method: "POST",
    url: "/api/authorize",
    schema: z.object({ success: z.boolean() }),
    payload: { groupIds, userId },
  });

export const init = () =>
  safeFetch({
    method: "GET",
    url: "/api/init",
    schema: z.object({
      username: z.string(),
      groupsOfUser: GroupSchema.array(),
    }),
  });

export const gamesOfUser = (username: string | null) =>
  safeFetch({
    method: "GET",
    url: `/api/getGames/${username}`,
    schema: GroupSchema.array(),
  });

export const startDraw = (groupname: string | null) =>
  safeFetch({
    method: "POST",
    url: `/api/start/${groupname}`,
    schema: GroupSchema,
  });

export const stopDraw = (groupname: string | null) =>
  safeFetch({
    method: "POST",
    url: `/api/stop/${groupname}`,
    schema: GroupSchema,
  });
export const editSelf = (
  groupname: string | null,
  username: string | null,
  editedUsername: string | null
) =>
  safeFetch({
    method: "PATCH",
    url: `/api/edit/${groupname}/${username}`,
    schema: GroupSchema,
    payload: { editedUsername },
  });
export const deleteFromList = (
  groupname: string | null,
  username: string | null
) =>
  safeFetch({
    method: "DELETE",
    url: `/api/delete/${groupname}/${username}`,
    schema: GroupSchema,
  });

export const drawName = (groupname: string | null, username: string | null) =>
  safeFetch({
    method: "POST",
    url: `/api/draw/${groupname}/${username}`,
    schema: z.object({ currentGroup: GroupSchema, chosenUser: UserSchema }),
  });

export const deleteGroup = (
  groupname: string | null,
  username: string | null
) =>
  safeFetch({
    method: "DELETE",
    url: `/api/deleteGroup/${groupname}/${username}`,
    schema: z.object({result: z.boolean()}),
  });
