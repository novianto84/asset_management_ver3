// src/app/layout.jsx
"use client"; // <- Penting untuk React Query bekerja

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const metadata = {
  title: "Generator Set Management System",
  description: "Manage and monitor your generator units",
};

export default function RootLayout({ children }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <div className="bg-gray-50 min-h-screen">
        {/* ✅ Bungkus children dengan QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </div>
    </>
  );
}
