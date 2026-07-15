import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tooltip } from "radix-ui";
import ErrorBoundry from "./ErrorBounds";
import ErrorFallback from "./ErrorFallback";
import Toast from "../shared/design-components/toast/Toast";

const queryClient = new QueryClient();

const AppProvider = ({
  children,
}: {
  children: ReactNode;
}): React.ReactNode => {
  return (
    // wraper for query client and error boundry
    <QueryClientProvider client={queryClient}>
      <Tooltip.Provider delayDuration={300}>
        <Toast />
        <ErrorBoundry fallback={<ErrorFallback />}>{children}</ErrorBoundry>
      </Tooltip.Provider>
    </QueryClientProvider>
  );
};

export default AppProvider;
