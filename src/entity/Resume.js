import { EntitySchema } from "typeorm";

export const ResumeEntity = new EntitySchema({
  name: "Resume",
  tableName: "resumes",
  columns: {
    resumeId: {
      primary: true,
      type: "int",
      generated: true
    },
    userId: {
      type: "int"
    },
    title: {
      type: "varchar"
    },
    introduce: {
      type: "varchar"
    },
    status: {
      type: "enum",
      enum: ["APPLY", "DROP", "PASS", "INTERVIEW1", "INTERVIEW2", "FINAL_PASS"],
      default: "APPLY"
    },
    createdAt: {
      type: "timestamp",
      createDate: true
    },
    updatedAt: {
      type: "timestamp",
      updateDate: true
    }
  },
  relations: {
    user: {
      target: "User",
      type: "many-to-one",
      joinColumn: { name: "userId" },
      onDelete: "CASCADE"
    }
  }
});