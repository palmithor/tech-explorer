import Elysia from "elysia";
import { createRemoteJWKSet, decodeJwt, errors, jwtVerify } from "jose";

const getBearerToken = (headers: Headers) =>
  headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;

export const jwtJwksValidation = ({ issuer }: { issuer: string }) =>
  new Elysia()
    .state("oidc-plugin-version", 1)
    .state("JWKS", createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`)))
    .onBeforeHandle(async ({ store: { JWKS }, set, request: { headers } }) => {
      const bearerToken = getBearerToken(headers);

      if (!bearerToken) {
        set.status = 401;
        return {
          status: "UNAUTHORIZED",
          details: { message: "Bearer token missing" },
        };
      }
      try {
        await jwtVerify(bearerToken, JWKS, { issuer });
      } catch (error) {
        set.status = 401;
        return {
          status: "UNAUTHORIZED",
          details: {
            code: error instanceof errors.JOSEError ? error.code : undefined,
            message: "Unable to decode bearer token",
          },
        };
      }
    })
    .derive(({ request: { headers }, store }) => {
      const claims = decodeJwt(getBearerToken(headers) as string);
      return { jwtClaims: claims };
    });
