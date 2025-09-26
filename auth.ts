import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrismaClient } from "@/lib/database";
import credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// Initialize standard MySQL connection via Prisma
const prisma = getPrismaClient();

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@email.com" },
        password: { label: "Password", type: "password", placeholder: "******" },
      },
      authorize: async (credentials) => {
        let user = null;

        if (!credentials || typeof credentials.password !== "string" || typeof credentials.email !== "string") {
          return Promise.reject(new Error("Invalid credentials"));
        }

        // logic to verify if the user exists
        user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          return Promise.reject(new Error("User not found."));
        }

        return user;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  callbacks: {
    session: ({ session }) => {
      return session;
    },
    jwt: ({ token, user }) => {
      return token;
    }
  },
});
