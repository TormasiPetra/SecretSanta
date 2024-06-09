import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  password: z.string(),
});

export const GroupSchema = z.object({
  id: z.number(),
  groupname: z.string(),
  budget: z.number(),
  finishDate: z.string(),
  admin: UserSchema.nullable(),
  users: z
    .object({
      user: UserSchema,
      alreadyDrawn: z.boolean().default(false),
      alreadyTaken: z.boolean().default(false),
    })
    .array(),
  alreadyDrawnUsers: z
    .object({
      user: UserSchema,
      santa: UserSchema,
    })
    .array(),
  isActive: z.boolean().default(false),
  isFinished: z.boolean().default(false),
  drawStarted: z.boolean().default(false),
});
