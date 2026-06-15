import { Navigate, Route, Routes } from "react-router-dom";
import { Login, HomeRouter } from "../pages";
import AdminLayout from "../layouts/AdminLayout";
import ProtectedRoute from "./protected-route";

import ContentManagementRouter from "../pages/content-management/ContentMngRoute";
import PeopleRouter from "../pages/people/PeopleRoute";
import SettingsRouter from "../pages/settings/SettingsRoute";
import SponsorsRouter from "../pages/sponsors/SponsorsRoute";
import RegistrationsRouter from "../pages/registrations/RegistrationsRoute";

export default function AppRouter() {
  return (
    // enter point for admin layout, includes protected route
    <Routes>
      <Route path="login" element={<Login />} />
      <Route
        path="*"
        element={
          <ProtectedRoute>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route
                  index
                  element={<Navigate to="/home/dashboard" replace />}
                />
                {/* Home / Dashboard / Versions */}
                <Route path="home/*" element={<HomeRouter />} />

                {/* Content Management */}
                <Route
                  path="content-management/*"
                  element={<ContentManagementRouter />}
                />

                {/* People */}
                <Route path="people/*" element={<PeopleRouter />} />

                {/* Sponsors */}
                <Route path="sponsors/*" element={<SponsorsRouter />} />

                {/* Settings */}
                <Route path="settings/*" element={<SettingsRouter />} />

                {/* Registrations */}
                <Route path="registrations/*" element={<RegistrationsRouter />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
