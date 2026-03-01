import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./components/Layout";
import { signOut } from "next-auth/react";
import useUserInfo from "./hooks/useUserInfo";
import UsernameForm from "./components/UsernameForm";

export default function Home() {
  const { userInfo, setUserInfo, status: userInfoStatus } = useUserInfo();

  const router = useRouter();

  async function logout() {
    setUserInfo(null);
    await signOut();
  }

  useEffect(() => {
    if (userInfoStatus === "loading") return;

    if (!userInfo) {
      router.push("/login");
    }
  }, [userInfo, userInfoStatus, router]);

  if (userInfoStatus === "loading") {
    return <div>Loading user info...</div>;
  }

  if (userInfo && !userInfo?.username) {
    return <UsernameForm />;
  }

  if (!userInfo) {
    return <div>Redirecting...</div>;
  }

  return (
    <Layout>
      <h1 className="text-lg font-bold p-4">Home</h1>
      <div className="p-5 text-center border-t border-twitterBorder">
        <button
          onClick={logout}
          className="bg-twitterWhite text-black px-5 py-2 rounded-full"
        >
          Logout
        </button>
      </div>
    </Layout>
  );
}
