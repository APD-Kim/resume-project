import { EntitySchema } from "typeorm";



export const UserEntity = new EntitySchema({
  name: "User", // 엔티티 이름
  tableName: "users", // DB에서 사용될 테이블 이름
  columns: {
    userId: {
      primary: true,
      type: "int",
      generated: true
    },
    clientId: {
      type: "varchar",
      nullable: true
    },
    email: {
      type: "varchar",
      unique: true,
      nullable: true
    },
    password: {
      type: "varchar",
      nullable: true
    },
    name: {
      type: "varchar"
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    },
    role: {
      type: "varchar",
      default: "user"
    }
  },
  relations: {
    resumes: {
      target: "Resume",
      type: "one-to-many",
      inverseSide: "user"
    }
  }
});