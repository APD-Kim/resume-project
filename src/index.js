import Resumerouter from "./routers/resume.routes";
import router from "./routers/user.routes";
import UserRouter from "./routers/user.routes";

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: 유저 추가 수정 삭제 조회
 */
router.post("/sing-up", UserRouter);
