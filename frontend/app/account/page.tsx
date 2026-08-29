"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/api";
import { dashboardFor, getSession, saveSession } from "../../lib/auth";

type AuthResult = {
  token: string;
  user: { name: string; email?: string; role: "customer" | "business" | "admin" };
};

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const session = getSession();
    if (session) window.location.replace(dashboardFor(session.user.role));
  }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api.post<AuthResult>(
        `/auth/${mode === "login" ? "login" : "register"}`,
        {
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
          ...(mode === "register" ? { role: form.get("role") } : {}),
        },
      );
      saveSession(data);
      localStorage.setItem("plateful_token", data.token);
      localStorage.setItem("plateful_role", data.user.role);
      setMessage(`Welcome, ${data.user.name}. Taking you to your dashboard…`);
      window.setTimeout(() => {
        window.location.href = dashboardFor(data.user.role);
      }, 500);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not continue");
    }
  };
  return (
    <main className="portal">
      <Link className="brand" href="/">
        <span>p</span> plateful
      </Link>
      <section className="auth-card">
        <p className="eyebrow">Your Plateful account</p>
        <h1>
          {mode === "register"
            ? "Join the good food movement."
            : "Welcome back."}
        </h1>
        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label>
                Name
                <input required name="name" placeholder="Your name" />
              </label>
              <label>
                I am a
                <select name="role">
                  <option value="customer">Customer</option>
                  <option value="business">Food business</option>
                </select>
              </label>
            </>
          )}
          <label>
            Email
            <input
              required
              name="email"
              type="email"
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              required
              name="password"
              type="password"
              minLength={8}
              placeholder="At least 8 characters"
            />
          </label>
          <button>{mode === "register" ? "Create account" : "Log in"}</button>
        </form>
        {message && <p className="form-message">{message}</p>}
        <p className="switch">
          {mode === "register" ? "Already a member?" : "New here?"}{" "}
          <button
            onClick={() => setMode(mode === "register" ? "login" : "register")}
          >
            {mode === "register" ? "Log in" : "Create an account"}
          </button>
        </p>
      </section>
    </main>
  );
}
