import type { Session, SessionUser } from "../auth/session";
import { http } from "./client";

/**
 * If your server mounts routes under /api (app.use("/api", router)),
 * set API_PREFIX = "/api".
 * Otherwise leave "".
 */
const API_PREFIX = "https://catering-api-4icb.onrender.com";

export const httpAdapter = {
  async login(email: string, password: string): Promise<Session> {
    // 1) Render login
    const loginRes = await http.post(`${API_PREFIX}/auth/login`, {
      email: email.trim(),
      password,
    });
    // loginRes = { accessToken, refreshToken, user: { id,email,role,name } }

    const accessToken: string = loginRes.accessToken;

    // 2) Verify role from Render API with /auth/me
    const meRes = await http.get(`${API_PREFIX}/auth/me`, {
      tokenOverride: accessToken,
    });
    // meRes = { user: { id,email,role,name } }

    const user: SessionUser = meRes.user;

    return {
      token: accessToken, // ✅ normalize to your app's Session shape
      user,
    };
  },

  // keep whatever other methods you add later; example:
  // getOverview: async ({ range }) => http.get(`${API_PREFIX}/overview?range=${range}`),
};
