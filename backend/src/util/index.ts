import { z } from "zod";
import fs from "fs/promises";

export const load = async <Schema extends z.ZodTypeAny>(
  filename: string,
  schema: Schema
): Promise<z.infer<typeof schema> | null> => {
  try {
    const path = `${__dirname}/../../database/${filename}.json`
    const rawData = await fs.readFile(path, 'utf-8')
    const data = JSON.parse(rawData)
    const validatedData = schema.parse(data)
    return validatedData
  } catch (error) {
    console.log(error)
    return null
  }
}

export const save = async <Schema extends z.ZodTypeAny>(
  filename: string,
  data: unknown,
  schema: Schema
): Promise<{ success: boolean }> => {
  try {
    const path = `${__dirname}/../../database/${filename}.json`
    const dataToInsert = schema.parse(data)
    const content = JSON.stringify(dataToInsert, null, 2)
    await fs.writeFile(path, content)
    return { success: true }
  } catch (error) {
    console.log(error)
    return  { success: false }
  }
}
