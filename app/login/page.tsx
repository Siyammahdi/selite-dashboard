"use client";

import Image from "next/image";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/auth";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <section className="animate-fade-up flex w-full shrink-0 flex-col items-center bg-forest px-8 pt-24 pb-16 md:w-[613px] md:px-[66px] md:pt-40 md:pb-[78px]">
        <div className="flex w-full max-w-[497px] flex-col gap-10 md:gap-[66px]">
          <div className="flex flex-col items-center gap-4">
            <div className="flex w-[111px] flex-col gap-1">
              <Image
                src="/icons/logo-login.svg"
                alt="Selite"
                width={113}
                height={32}
                className="h-8 w-[113px]"
                priority
              />
              <p className="font-brand text-[15px] font-medium tracking-[6.45px] text-white">lifestyle</p>
            </div>
            <h1 className="w-full text-center text-[40px] leading-none font-semibold text-white md:text-[56px]">
              Login Your Account
            </h1>
          </div>

          <form action={action} className="flex w-full flex-col gap-[25px]">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-white">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  defaultValue={DEMO_EMAIL}
                  autoComplete="username"
                  className="h-[42px] rounded border border-stone bg-white px-3 text-ink outline-none transition focus:ring-2 focus:ring-flame/40"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white">
                Password
                <input
                  type="password"
                  name="password"
                  required
                  defaultValue={DEMO_PASSWORD}
                  autoComplete="current-password"
                  className="h-[42px] rounded border border-stone bg-white px-3 text-ink outline-none transition focus:ring-2 focus:ring-flame/40"
                />
              </label>
            </div>

            {state.error ? (
              <p className="animate-fade-in rounded-md bg-white/10 px-3 py-2 text-sm text-[#ffd2c2]">{state.error}</p>
            ) : (
              <p className="text-xs text-white/70">
                Demo access: {DEMO_EMAIL} / {DEMO_PASSWORD}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="flex h-[50px] w-full items-center justify-center rounded-[6.316px] bg-flame text-xl font-medium text-snow transition hover:bg-[#e45d0d] active:scale-[0.99] disabled:opacity-70"
            >
              {pending ? "Signing in…" : "Login"}
            </button>
          </form>
        </div>
      </section>

      <div className="relative hidden min-h-dvh flex-1 overflow-hidden md:block">
        <Image
          src="/images/login-hero.png"
          alt=""
          fill
          priority
          className="object-cover object-[center_35%] transition duration-700"
          sizes="(min-width: 768px) 60vw, 0px"
        />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-forest/20" />
      </div>
    </div>
  );
}
