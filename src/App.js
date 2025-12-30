// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import IndexPage from "./components/IndexPage";
import BookingPage from "./components/BookingPage";
import ManageBookingPage from './components/ManageBookingPage';
import LoginPage from './components/LoginPage';
import CheckinPage from './components/CheckinPage';
import MyFlightsPage from './components/MyFlightsPage';
import PassengerInfoPage from './components/PassengerInfoPage';
import PaymentPage from './components/PaymentPage';
import SeatSelectionPage from './components/SeatSelectionPage';
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/managebooking" element={
          <Layout bg="/assets/background2.jpg">
            <ManageBookingPage />
          </Layout>} />
        <Route path="/login" element={
          <Layout bg="/assets/background2.jpg">
            <LoginPage />
          </Layout>} />
        <Route path="/checkin" element={
          <Layout bg="/assets/background2.jpg">
            <CheckinPage />
          </Layout>} />
        <Route path="/myflights" element={
          <Layout bg="/assets/background2.jpg">
            <MyFlightsPage />
          </Layout>} />
        <Route path="/passengerinfo" element={<PassengerInfoPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/seatselection" element={<SeatSelectionPage />} />
      </Routes>
    </Router>
  );
}

export default App;