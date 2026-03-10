import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { InterviewProvider } from "./context/InterviewContext";

import Landing      from "./pages/Landing/Landing";
import DomainSelect from "./pages/DomainSelect/DomainSelect";
import Interview    from "./pages/Interview/Interview";
import Report       from "./pages/Report/Report";

export default function App() {
  return (
    <InterviewProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/"          element={<Landing />} />
          <Route path="/setup"     element={<DomainSelect />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/report"    element={<Report />} />
        </Routes>
      </Router>
    </InterviewProvider>
  );
}