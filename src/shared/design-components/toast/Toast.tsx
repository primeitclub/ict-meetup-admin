import { Toaster } from "react-hot-toast";

const Toast = () => (
  <Toaster
    position="top-center"
    toastOptions={{
      duration: 5000,
      style: {
        fontSize: "0.875rem",
      },
      success: {
        style: { background: "#16a34a", color: "#fff" },
        iconTheme: { primary: "#fff", secondary: "#16a34a" },
      },
      error: {
        style: { background: "#dc2626", color: "#fff" },
        iconTheme: { primary: "#fff", secondary: "#dc2626" },
      },
    }}
  />
);

export default Toast;
