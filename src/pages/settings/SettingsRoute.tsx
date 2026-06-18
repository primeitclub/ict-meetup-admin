import { Navigate, Route, Routes } from "react-router-dom";
import {
  SettingsLayout,
  SocialMediaProfile,
  ContactManagement,
  PaymentSetup,
  ClubDetails,
} from "..";

const SettingsRouter = () => {
  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<Navigate to="club-details" replace />} />
        <Route path="club-details" element={<ClubDetails />} />
        <Route path="social-media-profile" element={<SocialMediaProfile />} />
        <Route path="contact-management" element={<ContactManagement />} />
        <Route path="payment-setup" element={<PaymentSetup />} />
      </Route>
    </Routes>
  );
};

export default SettingsRouter;
