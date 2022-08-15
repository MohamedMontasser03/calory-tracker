import { useSession as authUseSession } from "next-auth/react";
import { Session } from "../pages/api/auth/[...nextauth]";

export const getRedirection = (
  urlCondition: Record<string, boolean | undefined | null>
) => {
  return Object.keys(urlCondition).find((key) => urlCondition[key]);
};

type UseSessionReturn =
  | {
      data: Session;
      status: "authenticated";
    }
  | {
      data: null;
      status: "unauthenticated" | "loading";
    };

export const useSession = () =>
  authUseSession<false>() as unknown as UseSessionReturn;
