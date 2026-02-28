import { useRouter } from "next/router";
import useUserInfo from "../hooks/useUserInfo";
import { useState, useMemo, FormEvent } from "react";

export default function UsernameForm() {
  const { userInfo, status } = useUserInfo();
  const router = useRouter();

  const defaultUsername = useMemo(() => {
    if (!userInfo?.email) return "";
    return userInfo.email.split("@")[0].replace(/[^a-z]+/gi, "");
  }, [userInfo]);

  const [username, setUsername] = useState<string>(defaultUsername);

  async function handleFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await fetch("/api/users", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username }),
    });

    router.reload();
  }

  if (status === "loading") return null;

  return (
    <div className="flex h-screen items-center justify-center">
      <form className="text-center" onSubmit={handleFormSubmit}>
        <h1 className="text-xl mb-2">Pick a username</h1>

        <input
          type="text"
          className="block mb-1 bg-twitterBorder px-3 py-1 rounded-full"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <button className="block bg-twitterBlue w-full rounded-full py-1">
          Continue
        </button>
      </form>
    </div>
  );
}
