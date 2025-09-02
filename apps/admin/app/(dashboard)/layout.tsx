import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <main>{children}</main>
    </ProtectedRoute>
  );
};

export default Layout;
