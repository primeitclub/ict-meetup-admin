import { Navigate, Route, Routes } from "react-router-dom";
import Hero from "./hero/Hero";
import HeroForm from "./hero/HeroForm";
import ContentManagementLayout from "./ContentManagementLayout";
import About from "./about/About";
import AboutForm from "./about/AboutForm";
import EventsForm from "./events/EventsForm";
import EventCategories from "./events/EventCategories";
import Gallery from "./gallery/Gallery";
import GalleryForm from "./gallery/GalleryForm";
import Faqs from "./faqs/Faqs";
import FaqsForm from "./faqs/FaqsForm";
import EventCategoryForm from "./events/EventCategoryForm";
import { ContentEvents } from "..";

const ContentManagementRouter = () => {
  return (
    <Routes>
      <Route element={<ContentManagementLayout />}>
        <Route index element={<Navigate to="hero" replace />} />
        <Route path="hero">
          <Route index element={<Hero />} />
          <Route path="add" element={<HeroForm />} />
          <Route path="edit/:id" element={<HeroForm />} />
        </Route>
        <Route path="about">
          <Route index element={<About />} />
          <Route path="add" element={<AboutForm />} />
          <Route path="edit/:id" element={<AboutForm />} />
        </Route>
        <Route path="events">
          <Route index element={<ContentEvents />} />
          <Route path="add" element={<EventsForm />} />
          <Route path="edit/:id" element={<EventsForm />} />
          <Route path="categories">
            <Route index element={<EventCategories />} />
            <Route path="add" element={<EventCategoryForm />} />
            <Route path="edit/:id" element={<EventCategoryForm />} />
          </Route>
        </Route>
        <Route path="gallery">
          <Route index element={<Gallery />} />
          <Route path="add" element={<GalleryForm />} />
          <Route path="edit/:id" element={<GalleryForm />} />
        </Route>
        <Route path="faqs">
          <Route index element={<Faqs />} />
          <Route path="add" element={<FaqsForm />} />
          <Route path="edit/:versionId" element={<FaqsForm />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ContentManagementRouter;
