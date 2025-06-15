import { createClient } from "redis";

const redisClient = createClient({
  username: 'default',
  password:"x9zhMaBSnhVBzAnZtvBSvEV8baADneQe",
   socket: {
        host: 'redis-16094.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 16094
    }
});

redisClient.on("error", (err) => console.error("Redis Error: ", err));

(async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis");
  } catch (err) {
    console.error("Redis connection error:", err);
  }
})();

export default redisClient;
