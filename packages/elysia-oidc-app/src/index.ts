import { Elysia } from "elysia";
import { jwtJwksValidation } from "./auth/oicd";

const issuer = process.env.JWK_ISSUER as string;
const app = new Elysia()
	.group("/api/v1", (app) =>
		app
			.use(jwtJwksValidation({ issuer }))
			.get("/", ({ store, request, jwtClaims }) => ({ jwtClaims })),
	)
	.get("/", () => "Hello World")
	.listen(3005);

console.log(
	`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
