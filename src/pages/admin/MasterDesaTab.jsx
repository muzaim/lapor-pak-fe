import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import MasterKepalaDesaTab from './MasterKepalaDesaTab';
import MasterVisiMisiTab from './MasterVisiMisiTab';
import MasterGeografisTab from './MasterGeografisTab';
import MasterOfficeInfoTab from './MasterOfficeInfoTab';
import MasterAppSettingsTab from './MasterAppSettingsTab';

export default function MasterDesaTab({ subTab }) {
  const location = useLocation();
  const { section } = useParams();

  let activeSection = subTab || section;
  if (!activeSection) {
    if (location.pathname.includes('/visi-misi')) activeSection = 'visi-misi';
    else if (location.pathname.includes('/geografis')) activeSection = 'geografis';
    else if (location.pathname.includes('/office-info')) activeSection = 'office-info';
    else if (location.pathname.includes('/app-settings')) activeSection = 'app-settings';
    else activeSection = 'kepala-desa';
  }

  return (
    <div className="w-full">
      {activeSection === 'kepala-desa' && <MasterKepalaDesaTab />}
      {activeSection === 'visi-misi' && <MasterVisiMisiTab />}
      {activeSection === 'geografis' && <MasterGeografisTab />}
      {activeSection === 'office-info' && <MasterOfficeInfoTab />}
      {activeSection === 'app-settings' && <MasterAppSettingsTab />}
    </div>
  );
}
