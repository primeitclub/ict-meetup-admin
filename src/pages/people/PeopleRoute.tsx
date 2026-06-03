import { Navigate, Route, Routes } from "react-router-dom";
import {
  PeopleLayout,
  Speakers,
  SpeakersForm,
  Teams,
  TeamsForm,
  TeamCategories,
  TeamCategoryForm,
  Designations,
  DesignationForm,
} from "..";

const PeopleRouter = () => {
  return (
    <Routes>
      <Route element={<PeopleLayout />}>
        <Route index element={<Navigate to="speakers" replace />} />
        <Route path="speakers">
          <Route index element={<Speakers />} />
          <Route path="add" element={<SpeakersForm />} />
          <Route path="edit/:id" element={<SpeakersForm />} />
        </Route>
        <Route path="teams">
          <Route index element={<Teams />} />
          <Route path="add" element={<TeamsForm />} />
          <Route path="edit/:id" element={<TeamsForm />} />
          <Route path="categories">
            <Route index element={<TeamCategories />} />
            <Route path="add" element={<TeamCategoryForm />} />
            <Route path="edit/:id" element={<TeamCategoryForm />} />
          </Route>
          <Route path="designations">
            <Route index element={<Designations />} />
            <Route path="add" element={<DesignationForm />} />
            <Route path="edit/:id" element={<DesignationForm />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default PeopleRouter;
