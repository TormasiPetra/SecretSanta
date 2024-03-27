import { z } from "zod";
import fs from "fs/promises";

export const load = async (filename: string) => {
  try {
    const rawData = await fs.readFile(
      `${__dirname}/../../database/${filename}.json`,
      "utf-8"
    );
    const data = JSON.parse(rawData);
    return data;
  } catch (error) {
    return null;
  }
};

export const save = async (filename: string, data: any) => {
  try {
    const fileContent = JSON.stringify(data);
    await fs.writeFile(
      `${__dirname}/../database/${filename}.json`,
      fileContent
    );
    return true;
  } catch (error) {
    return false;
  }
};
