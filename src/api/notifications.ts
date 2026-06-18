import { post } from "./client";

export function registerFcmToken(token: string): Promise<{ success: string }> {
  return post<{ success: string }>("/ims/api/token/post/", { token });
}
