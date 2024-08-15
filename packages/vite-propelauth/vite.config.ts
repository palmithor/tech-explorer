import react from "@vitejs/plugin-react-swc";
import { verify } from "jsonwebtoken";
import jwt, { type JwtPayload } from "jsonwebtoken";
import jwksClient from "jwks-rsa";
import { defineConfig } from "vite";

const client = jwksClient({
  jwksUri: `${process.env.VITE_AUTH_URL}/.well-known/jwks.json`,
});
// Function to get the signing key
const getKey = (header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) => {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(err, signingKey);
  });
};

// Function to validate the token
const validateToken = (token: string): Promise<JwtPayload | string | null> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, getKey, { algorithms: ["RS256"] }, (err, decoded) => {
      if (err) {
        return reject(err);
      }
      resolve(decoded ?? "");
    });
  });
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        changeOrigin: true,
        configure: (proxy, options) => {
          proxy.on("proxyReq", async (proxyReq, req, res, options) => {
            if (req.url === "/api/auth/session" && req.method === "POST") {
              const token = req.headers.authorization?.split(" ")[1] || null;
              if (token) {
                try {
                  await validateToken(token);

                  res.setHeader(
                    "Set-Cookie",
                    `rm-session-local=${token}; HttpOnly; SameSite=Lax; Path=/; domain=localhost; Max-Age=3600`,
                  );
                  res.statusCode = 200;
                } catch (err) {
                  res.statusCode = 401;
                }
              } else {
                res.statusCode = 401;
              }
            } else {
              res.statusCode = 404;
            }
            res.end();
          });
        },
      },
    },
  },
});
