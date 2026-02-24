"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession, ClientSafeProvider } from "next-auth/react";

interface LoginPageProps {
  providers: Record<string, ClientSafeProvider> | null;
}

export default function LoginClient({ providers }: LoginPageProps) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading") return null;

  return (
    <div className="flex items-center justify-center h-screen">
      {providers &&
        Object.values(providers).map((provider) => (
          <div key={provider.id}>
            <button
              onClick={() => signIn(provider.id)}
              className="bg-twitterWhite pl-3 pr-5 py-2 text-black rounded-full flex items-center gap-2"
            >
              <Image
                src="/google.png"
                alt="Google"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              Sign in with {provider.name}
            </button>
          </div>
        ))}
    </div>
  );
}
