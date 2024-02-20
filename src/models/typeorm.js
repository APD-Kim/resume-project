import { createConnection } from "typeorm";
import { UserEntity } from "../entity/User.js";
import { ResumeEntity } from "../entity/Resume.js";

const connectionPromise = createConnection({
  type: "mysql",
  host: "express-database.cxgaygw2ostf.ap-northeast-2.rds.amazonaws.com",
  port: 3306,
  username: "root",
  password: "lol940620",
  database: "typeORM",
  synchronize: true,
  logging: false,
  entities: [UserEntity, ResumeEntity],
}).then(connection => {
  console.log("Connection established");
  return connection;
}).catch(error => {
  console.log("Connection error: ", error);
  throw error;
});

export default connectionPromise;