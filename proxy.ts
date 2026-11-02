import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./utils/auth";
import { refreshAccessToken } from "./utils/refreshSession";
import { accessCookieOptions } from "./utils/cookies";

const PROTECTED_PREFIXES = ["/p-user", "/p-admin"];


export async function proxy(req: NextRequest) {
   
   const { pathname, search } = req.nextUrl;

   const accessToken = req.cookies.get('token')?.value;
   const refreshToken = req.cookies.get('refresh-token')?.value;

   // Valid Access-Token
   if (accessToken && verifyAccessToken(accessToken)?.email) {
      console.log('🐲 Valid access-token')
      return NextResponse.next();
   }

   if (accessToken) {
      console.log("🚫 Invalid/Expired Access-Token")
   }
   else {
      console.log("🚫 No Access-Token")
   }


   // Invalid Access-Token -> Try to refresh
   let invalidRefreshToken = false;

   if (refreshToken) {

      console.log('🔄 Refreshing token...')

      try {

         const newAccessToken = await refreshAccessToken(refreshToken);

         if (newAccessToken) {

            const requestHeaders = new Headers(req.headers);

            const oldCookies = req.headers.get('cookie') ?? '';
   
            const cleaned = oldCookies
               .split(';')
               .map(c => c.trim())
               .filter(c => c && !c.startsWith('token='))
               .join('; ')
            ;
            
            requestHeaders.set(
               'cookie',
               cleaned ? `${cleaned}; token=${newAccessToken}` : `token=${newAccessToken}`
            )
            
   
            const response = NextResponse.next(
               {
                  request: { headers: requestHeaders }
               }
            )
   
            // also we put new access-token in 'response' which is returned from destination and going back to 'browser'
            response.cookies.set(
               'token',
               newAccessToken,
               accessCookieOptions
            )
   
            return response;
         }

         invalidRefreshToken = true;
         
      } catch (error) {
         console.log("🔴 refresh failed:", error instanceof Error ? error.message : error);
      }
   }

   if (refreshToken) {
      console.log("🚫 Invalid/Expired Refresh-Token")
   }
   else {
      console.log("🚫 No Refresh-Token")
   }

   // Not any valid-session -> Unauthorized 
   //  ->  if not proteced page  -> continue
   //  ->  if proteced page  -> redirect to /signin
   const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

   const response = isProtected
   ? NextResponse.redirect(
      new URL(`/signin?return_url=${encodeURIComponent(`${pathname}${search}`)}`, req.url)
   )
   : NextResponse.next()


   // clean invalid refresh-token from browser
   if (invalidRefreshToken) {
      response.cookies.set(
         'refresh-token',
         '',
         {
            path: '/',
            maxAge: 0,
         }
      )
   }

   return response;
}


export const config = {
   matcher: [
      "/((?!_next/static|_next/image|favicon.ico|\\.well-known|api/auth|api/files|.*\\.(?:png|jpg|jpeg|svg|webp|ico|css|js)$).*)",
   ],
};