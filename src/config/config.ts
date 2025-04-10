import { config as conf } from "dotenv";

conf();

const _config = {
  port: process.env.PORT,
  databaseURL: process.env.MONGO_CONNECTION_STRING,
  env: process.env.NODE_ENV,
  jwtSecret: process.env.JWT_SECRET,
  coudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  coudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  coudinaryCloud: process.env.CLOUDINARY_CLOUD,
  frontendDomain: process.env.FRONTEND_DOMAIN,
};

export const config = Object.freeze(_config);
