import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import Flight from "./pages/Flight";
import Service from "./pages/Service";
import Feedback from "./pages/Feedback";
import Promotion from "./pages/Promotion";
import Manager from "./pages/Manager";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/flight" element={<Flight />} />
        <Route path="/service" element={<Service />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/promotion" element={<Promotion />} />
        <Route path="/manager" element={<Manager />} />
      </Routes>
    </Router>
  );
}

export default App;
