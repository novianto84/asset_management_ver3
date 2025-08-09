import * as React from "react";
import { useSession } from "@auth/create/react";
import { useQuery } from "@tanstack/react-query";

const useUser = () => {
  const { data: session, status } = useSession();

  const {
    data: userData,
    isLoading: userLoading,
    refetch,
  } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        if (response.status === 404) {
          // User not found in system, return session user
          return session?.user || null;
        }
        throw new Error("Failed to fetch user data");
      }
      const data = await response.json();
      return data.user;
    },
    enabled: !!session?.user, // Only run query if session exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  const loading = status === "loading" || userLoading;
  const user = userData || session?.user || null;

  return {
    user,
    data: user,
    loading,
    refetch,
  };
};

export { useUser };

export default useUser;
