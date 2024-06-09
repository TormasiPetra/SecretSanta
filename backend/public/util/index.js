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
exports.save = exports.load = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const load = (filename, schema) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const path = `${__dirname}/../../database/${filename}.json`;
        const rawData = yield promises_1.default.readFile(path, 'utf-8');
        const data = JSON.parse(rawData);
        const validatedData = schema.parse(data);
        return validatedData;
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
exports.load = load;
const save = (filename, data, schema) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const path = `${__dirname}/../../database/${filename}.json`;
        const dataToInsert = schema.parse(data);
        const content = JSON.stringify(dataToInsert, null, 2);
        yield promises_1.default.writeFile(path, content);
        return { success: true };
    }
    catch (error) {
        console.log(error);
        return { success: false };
    }
});
exports.save = save;
