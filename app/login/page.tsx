import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh bg-canvas">
      <section className="flex w-full shrink-0 flex-col items-center bg-forest px-8 pt-24 pb-16 md:w-[613px] md:px-[66px] md:pt-40 md:pb-[78px]">
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

          <form action="/" className="flex w-full flex-col gap-[25px]">
            <div className="flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm text-white">
                Email
                <input
                  type="email"
                  name="email"
                  required
                  className="h-[42px] rounded border border-stone bg-white px-3 text-ink outline-none"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-white">
                Password
                <input
                  type="password"
                  name="password"
                  required
                  className="h-[42px] rounded border border-stone bg-white px-3 text-ink outline-none"
                />
              </label>
            </div>

            <button
              type="submit"
              className="flex h-[50px] w-full items-center justify-center rounded-[6.316px] bg-flame text-xl font-medium text-snow"
            >
              Login
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
          className="object-cover object-[center_35%]"
          sizes="(min-width: 768px) 60vw, 0px"
        />
      </div>
    </div>
  );
}
