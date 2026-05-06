"use server";

import { signIn } from "@/auth";

export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/chat" });
}

export async function signInWithGithub() {
  await signIn("github", { redirectTo: "/chat" });
}
