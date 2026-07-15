import { Route, Routes } from "react-router-dom";
import Registrations from "./Registrations";

export default function RegistrationsRouter() {
  return (
    <Routes>
      <Route index element={<Registrations />} />
    </Routes>
  );
}
