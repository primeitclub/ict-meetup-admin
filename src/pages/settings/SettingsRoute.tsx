import { Navigate, Route, Routes } from "react-router-dom";
import {
  SettingsLayout,
  SocialMediaProfile,
  ContactManagement,
  PaymentSetup,
} from "..";
import ContactForm from "./ContactForm";
import SocialMediaForm from "./SocialMediaForm";
import PaymentForm from "./PaymentForm";

const SettingsRouter = () => {
  return (
    <Routes>
      <Route element={<SettingsLayout />}>
        <Route index element={<Navigate to="social-media-profile" replace />} />

        <Route path="social-media-profile">
          <Route index element={<SocialMediaProfile />} />
          <Route path="add" element={<SocialMediaForm />} />
          <Route path="edit/:id" element={<SocialMediaForm />} />
        </Route>

        <Route path="contact-management">
          <Route index element={<ContactManagement />} />
          <Route path="add" element={<ContactForm />} />
          <Route path="edit/:id" element={<ContactForm />} />
        </Route>

        <Route path="payment-setup">
          <Route index element={<PaymentSetup />} />
          <Route path="add" element={<PaymentForm />} />
          <Route path="edit/:id" element={<PaymentForm />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SettingsRouter;
