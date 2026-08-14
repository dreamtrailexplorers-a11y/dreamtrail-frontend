import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from '../pages/Home/Home';
import TripDetails from '../pages/TripDetails/TripDetails';
import CreatorTripDetails from '../pages/CreatorTripDetails/CreatorTripDetails';
import CreatorTrips from '../pages/CreatorTrips/CreatorTrips';
import GroupTrips from '../pages/GroupTrips/GroupTrips';
import TourPackages from '../pages/TourPackages/TourPackages';
import UpcomingTripsPage from '../pages/UpcomingTripsPage/UpcomingTripsPage';

import DestinationPage from '../pages/DestinationPage/DestinationPage';
import AttractionPage from '../pages/AttractionPage/AttractionPage';
import ActivityDetailsPage from '../pages/ActivityDetailsPage/ActivityDetailsPage';
import BlogDetailsPage from '../pages/BlogDetailsPage/BlogDetailsPage';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Profile from '../pages/Profile/Profile';
import DynamicPage from '../pages/DynamicPage/DynamicPage';
import DynamicCustomPage from '../pages/DynamicCustomPage/DynamicCustomPage';
import AboutUs from '../pages/AboutUs/AboutUs';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/tour-packages" element={<TourPackages />} />
      <Route path="/upcoming-trips/:month" element={<UpcomingTripsPage />} />
      <Route path="/group-trips" element={<GroupTrips />} />
      <Route path="/creator-trips" element={<CreatorTrips />} />
      <Route path="/destinations/:slug" element={<DestinationPage />} />
      <Route path="/attractions/:slug" element={<AttractionPage />} />
      <Route path="/activity/:slug" element={<ActivityDetailsPage />} />
      <Route path="/blog/:slug" element={<BlogDetailsPage />} />
      <Route path="/tours/:slug" element={<TripDetails />} />
      <Route path="/trip" element={<TripDetails />} />
      <Route path="/creator-trip/:id" element={<CreatorTripDetails />} />
      <Route path="/creator-trip" element={<CreatorTripDetails />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />

      {/* Footer / Dynamic Pages */}
      <Route path="/about" element={<AboutUs />} />
      <Route path="/careers" element={<DynamicPage title="Careers" contentKey="careersContent" />} />
      <Route path="/contact" element={<DynamicPage title="Contact Us" contentKey="contactUsContent" />} />
      <Route path="/terms" element={<DynamicPage title="Terms & Conditions" contentKey="termsContent" />} />
      <Route path="/privacy" element={<DynamicPage title="Privacy Policy" contentKey="privacyPolicyContent" />} />
      <Route path="/cancellation" element={<DynamicPage title="Cancellation and Refund Terms" contentKey="cancellationContent" />} />
      <Route path="/payment" element={<DynamicPage title="Payment Details" contentKey="paymentDetailsContent" />} />
      
      {/* Dynamic Custom Block Builder Pages */}
      <Route path="/page/:slug" element={<DynamicCustomPage />} />

      {/* Admin Route */}
      <Route path="/admin/*" element={<AdminDashboard />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
