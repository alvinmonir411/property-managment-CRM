"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const LoginPage = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    console.log(email, password);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        toast.error("Login Failed! Check your email or password.");
      } else {
        toast.success("Login Successful!");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className=" min-h-screen flex justify-center mt-20 items-center shadow-2xl">
      <form
        onSubmit={handleSubmit}
        className="p-10 shadow-lg rounded-2xl  space-y-4 w-96"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          className="w-full border p-2 rounded-xl"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          className="w-full border p-2 rounded-xl"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700 transition"
        >
          Login
        </button>

        <p className="text-center py-5">
          dont have any account?{" "}
          <Link href={"/auth/signup"} className="hover:underline">
            Creat An Account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
