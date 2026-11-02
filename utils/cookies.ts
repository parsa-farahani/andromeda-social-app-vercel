const isProd = process.env.NODE_ENV === "production";

export const accessCookieOptions = {
   path: "/",
   httpOnly: true,
   secure: isProd,
   sameSite: "lax" as const,
   maxAge: 60 * 15,
};

export const refreshCookieOptions = {
   path: "/",
   httpOnly: true,
   secure: isProd,
   sameSite: "lax" as const,
   maxAge: 60 * 60 * 24 * 15,
};