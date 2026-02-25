import LoginClient from "./LoginClient";
import { getProviders } from "next-auth/react";

export default async function LoginPage() {
  const providers = await getProviders();

  return <LoginClient providers={providers} />;
}
