import React from 'react';
import { OfficialHomepage } from './components/OfficialHomepage';
import { OfficialRentalPage } from './components/OfficialRentalPages';

export default function App() {
  const path = window.location.pathname;

  if (path !== '/') {
    return <OfficialRentalPage path={path} />;
  }

  return (
    <OfficialHomepage />
  );
}
