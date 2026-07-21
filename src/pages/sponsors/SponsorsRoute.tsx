import { Navigate, Route, Routes } from "react-router-dom";
import {
  Categories,
  CategoryForm,
  AllSponsors,
  SponsorForm,
  SponsorsLayout,
} from "..";

const SponsorsRouter = () => {
  return (
    <Routes>
      <Route element={<SponsorsLayout />}>
        <Route index element={<Navigate to="categories" replace />} />
        <Route path="categories">
          <Route index element={<Categories />} />
          <Route path="add" element={<CategoryForm />} />
          <Route path="edit/:id" element={<CategoryForm />} />
        </Route>
        <Route path="all-sponsors">
          <Route index element={<AllSponsors />} />
          <Route path="add" element={<SponsorForm />} />
          <Route path="edit/:id" element={<SponsorForm />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SponsorsRouter;
