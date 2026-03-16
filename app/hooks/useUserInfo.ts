import { UserWithId } from "../lib/auth";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface User {
  _id: string;
  name?: string;
  email?: string;
  image?: string;
  username?: string;
}

type Status = "loading" | "authenticated" | "unauthenticated";

interface UseUserInfoReturn {
  userInfo: User | null;
  setUserInfo: React.Dispatch<React.SetStateAction<User | null>>;
  status: Status;
}

export default function useUserInfo(): UseUserInfoReturn {
  const { data: session, status: sessionStatus } = useSession();

  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [status, setStatus] = useState<Status>("loading");

  useEffect(() => {
    async function getUserInfo() {
      if (sessionStatus === "loading") return;

      if (sessionStatus === "unauthenticated") {
        setStatus("unauthenticated");
        return;
      }

      const user = session?.user as UserWithId | undefined;

      if (!user?.id) return;

      try {
        const response = await fetch(`/api/users?id=${user.id}`);
        const json = await response.json();

        const userData: User = {
          _id: json.user.id,
          name: json.user.name,
          email: json.user.email,
          image: json.user.image,
          username: json.user.username,
        };

        setUserInfo(userData);
        setStatus("authenticated");
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        setStatus("unauthenticated");
      }
    }

    getUserInfo();
  }, [sessionStatus, session]);

  return { userInfo, setUserInfo, status };
}
