import connectToDB from "@/configs/db";
import UserModel from "@/models/User";
import { verifyAccessToken } from "@/utils/auth";
import { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
   
   const cookieStore = await cookies();
   try {

      const refreshToken = cookieStore.get("refresh-token")?.value;

      
      if (refreshToken) {
         await connectToDB();
         await UserModel.updateOne(
            { refreshToken },
            { $unset: { refreshToken: "" } }
         );
      }

      // const accessToken = cookieStore.get('token');

      // if (!accessToken?.value) {
      //    return NextResponse.json(
      //       { message: "UnAuthorized" },
      //       { status: 401 }
      //    );
      // }
      
      // const tokenPayload = verifyAccessToken(accessToken.value);

      // if (!tokenPayload) {
      //    return NextResponse.json(
      //       { message: "UnAuthorized" },
      //       { status: 401 }
      //    );
      // }

      // await connectToDB();

      // const user = await UserModel.findOne(
      //    {
      //       email: (tokenPayload as JwtPayload).email,
      //    }
      // )

      // if (!user) {
      //    return NextResponse.json(
      //       { message: "User not found." },
      //       { status: 404 }
      //    );
      // }

      // cookieStore.delete('token');
      // cookieStore.delete('refresh-token');

      // user.refreshToken = "";
      // await user.save();
      
      const response = NextResponse.json(
         { message: "Signed Out Successfully." },
         { status: 200 }
      );

      response.cookies.set("token", "", { path: "/", maxAge: 0 });
      response.cookies.set("refresh-token", "", { path: "/", maxAge: 0 });

      return response;

   } catch (error) {

      console.log(`🔴 Error -> ${error}`);
      
      return NextResponse.json(
         { message: "Internal Server Error" },
         { status: 500 }
      );
   }
}