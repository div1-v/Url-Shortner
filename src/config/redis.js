const { createClient } = require("redis");
let client;
(async () => {

  try {
    
      client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASS,
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT,
        },
      });
    
      await client.connect();
      client.on("error", (err) => console.log("Redis Client Error", err));
      client.on("connect", () => console.log("Redis Client Error"));
      console.log("Redis Connected");
      
  } catch (error) {
    console.log("Error Connection to Redis");
  }
})();

module.exports = client;
