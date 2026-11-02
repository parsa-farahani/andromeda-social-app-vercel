import connectToDB from "@/configs/db";
import UserModel from "@/models/User";
import { generateAccessToken, verifyRefreshToken } from "@/utils/auth";


export async function refreshAccessToken(refreshToken: string): Promise<string | null> {

   const payload = verifyRefreshToken(refreshToken);
   if (!payload?.email) return null;

   await connectToDB();

   const user = await UserModel.findOne({ refreshToken }, "email isBanned");
   if (!user || user.isBanned) return null;

   return generateAccessToken({ email: user.email });
}