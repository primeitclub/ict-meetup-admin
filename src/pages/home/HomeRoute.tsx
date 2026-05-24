import { Navigate, Route, Routes } from "react-router-dom";
import { Dashboard, Versions, VersionForm } from "..";
import HomeLayout from "./HomeLayout";

const HomeRouter = () => {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="versions">
          <Route index element={<Versions />} />
          <Route path="add" element={<VersionForm />} />
          <Route path="edit/:id" element={<VersionForm />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default HomeRouter;
