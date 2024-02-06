import jwt from "jsonwebtoken";
import {
  refreshSecretKey,
  secretKey,
  options,
} from "../../config/secretkey.js";

const TOKEN_EXPIRED = -3;
const TOKEN_INVALID = -2;

export async function sign(user) {
  /* 현재는 idx와 email을 payload로 넣었지만 필요한 값을 넣으면 됨! */
  const payload = {
    userId: user.userId,
    role: user.role,
  };
  const refreshTokenPayload = {
    userId: user.userId,
  };
  const refreshToken = jwt.sign(refreshTokenPayload, refreshSecretKey, {
    expiresIn: "7d",
  });
  const result = {
    //sign메소드를 통해 access token 발급!
    token: jwt.sign(payload, secretKey, options),
    refreshToken: refreshToken,
  };
  return result;
}

export async function signAdmin(user) {
  /* 현재는 idx와 email을 payload로 넣었지만 필요한 값을 넣으면 됨! */
  const payload = {
    userId: user.userId,
    role: "admin",
  };
  const refreshTokenPayload = {
    userId: user.userId,
  };
  const refreshToken = jwt.sign(refreshTokenPayload, adminSecretKey, {
    expiresIn: "7d",
  });
  const result = {
    //sign메소드를 통해 access token 발급!
    token: jwt.sign(payload, secretKey, options),
    refreshToken: refreshToken,
  };
  return result;
}

export async function verify(token) {
  let decoded;
  try {
    // verify를 통해 값 decode!
    let decodedToken = decodeURIComponent(token).replace("Bearer ", "");
    decoded = jwt.verify(decodedToken, secretKey);
  } catch (err) {
    if (err.message === "jwt expired") {
      console.log("expired token");
      return TOKEN_EXPIRED;
    } else if (err.message === "invalid token") {
      console.log("invalid token");
      console.log(TOKEN_INVALID);
      return TOKEN_INVALID;
    } else {
      console.log("invalid token");
      return TOKEN_INVALID;
    }
  }
  return decoded;
}
export async function verifyRefresh(token) {
  let decoded;
  try {
    // verify를 통해 값 decode!
    let decodedToken = decodeURIComponent(token).replace("Bearer ", "");
    decoded = jwt.verify(decodedToken, refreshSecretKey);
  } catch (err) {
    if (err.message === "jwt expired") {
      console.log("expired token");
      return TOKEN_EXPIRED;
    } else if (err.message === "invalid token") {
      console.log("invalid token");
      console.log(TOKEN_INVALID);
      return TOKEN_INVALID;
    } else {
      console.log("invalid token");
      return TOKEN_INVALID;
    }
  }
  return decoded;
}
