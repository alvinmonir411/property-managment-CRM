import { NextResponse } from "next/server";
import { auth } from "./app/auth";

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const userRole = (req.auth?.user as any)?.role;
    const { nextUrl } = req;

    const path = nextUrl.pathname;

    // ১. রুট ক্যাটাগরি নির্ধারণ
    const isAdminRoute = path.startsWith("/dashboard/admin");
    const isProtectedRoute = path.startsWith('/dashboard') || path.startsWith('/profile') || path.startsWith('/settings');

    // ২. যদি লগইন না থাকে এবং প্রোটেক্টেড বা অ্যাডমিন রুটে যেতে চায়
    if (!isLoggedIn && (isProtectedRoute || isAdminRoute)) {
        // আপনার সাইন-আপ বা লগইন পেজের সঠিক পাথ দিন (যেমন: /auth/login)
        return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }

    // ৩. যদি লগইন থাকে কিন্তু অ্যাডমিন রুটে যেতে চায় এবং রোল 'admin' না হয়
    if (isAdminRoute && userRole !== "admin") {
        // সাধারণ ইউজারদের অ্যাডমিন রুটে ঢুকতে না দিয়ে ড্যাশবোর্ড বা হোমপেজে পাঠিয়ে দিন
        return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};