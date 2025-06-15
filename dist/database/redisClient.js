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
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const redisClient = (0, redis_1.createClient)({
    username: 'default',
    password: "x9zhMaBSnhVBzAnZtvBSvEV8baADneQe",
    socket: {
        host: 'redis-16094.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16094
    }
});
redisClient.on("error", (err) => console.error("Redis Error: ", err));
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield redisClient.connect();
        console.log("Connected to Redis");
    }
    catch (err) {
        console.error("Redis connection error:", err);
    }
}))();
exports.default = redisClient;
