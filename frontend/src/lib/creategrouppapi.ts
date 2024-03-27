import { safeFetch } from "./safefetch";
import {z} from "zod"

export const createGroup = (groupname: string, username: string, email: string) => safeFetch({
    method: "POST",
    url: "/api/groups",
    schema: z.object({id: z.number()}),
    payload: {groupname, username, email}
})