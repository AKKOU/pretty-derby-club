
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Preloader from "./components/Preloader";
import IndexPage from "./IndexPage";
import MembersPage from "./MembersPage";
import EventsPage from "./EventsPage";
import ContactPage from "./ContactPage";

export default function App() {
  return (
    <BrowserRouter>
      <Preloader>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </Preloader>
    </BrowserRouter>
  );
}
