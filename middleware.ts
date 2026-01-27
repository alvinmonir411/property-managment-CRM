import { auth } from "@/app/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;

    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = nextUrl.pathname.startsWith("/signup") || nextUrl.pathname.startsWith("/login") || nextUrl.pathname === "/";

    if (isDashboardRoute && !isLoggedIn) {
        return NextResponse.redirect(new URL("/signup", nextUrl));
    }

    if (isAuthRoute && isLoggedIn) {
        // Redirect to appropriate dashboard based on role
        const role = (req.auth?.user as any)?.role;
        if (role === "admin") return NextResponse.redirect(new URL("/dashboard/admin", nextUrl));
        if (role === "agent") return NextResponse.redirect(new URL("/dashboard/agents", nextUrl));
        return NextResponse.redirect(new URL("/dashboard/user", nextUrl));
    }

    return NextResponse.next();
})

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
