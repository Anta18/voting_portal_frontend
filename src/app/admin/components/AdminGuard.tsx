"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    console.log(role);
    if (role != '"admin"' && role != '"root"') {
      router.push("/");
    }
  }, [router]);

  return <>{children}</>;
}
