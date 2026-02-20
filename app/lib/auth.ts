import clientPromise from "./mongodb";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

interface UserWithId {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ token, session }) {
      if (session.user && token.sub) {
        (session.user as UserWithId).id = token.sub;
      }
      return session;
    },
  },
};
