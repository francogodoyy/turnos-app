import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { auth: edgeAuth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
});
