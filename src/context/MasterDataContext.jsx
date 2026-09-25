import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const MasterDataContext = createContext();

export function MasterDataProvider({ children }) {
  const [appSettings, setAppSettings] = useState({
    app_name: 'Lapor Pak!',
    village_name: 'Desa Sukamaju',
    logo_url: null,
  });
  const [villageHead, setVillageHead] = useState(null);
  const [visionMission, setVisionMission] = useState(null);
  const [geographics, setGeographics] = useState(null);
  const [officeInfo, setOfficeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMasterData = async () => {
    const startTime = Date.now();
    try {
      const res = await api.get('/master/all');
      const data = res.data?.data || res.data;
      if (data) {
        if (data.app_settings) setAppSettings(data.app_settings);
        if (data.village_head) setVillageHead(data.village_head);
        if (data.vision_mission) setVisionMission(data.vision_mission);
        if (data.geographics) setGeographics(data.geographics);
        if (data.office_info) setOfficeInfo(data.office_info);
      }
    } catch (err) {
      console.warn('Gagal memuat master data terpusat:', err);
    } finally {
      const elapsed = Date.now() - startTime;
      const remainingDelay = Math.max(0, 1000 - elapsed);
      setTimeout(() => {
        setLoading(false);
      }, remainingDelay);
    }
  };

  useEffect(() => {
    refreshMasterData();
  }, []);

  useEffect(() => {
    if (appSettings?.app_name) {
      document.title = appSettings.app_name;
    }
    if (appSettings?.logo_url) {
      let iconLink = document.querySelector("link[rel*='icon']");
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'shortcut icon';
        document.head.appendChild(iconLink);
      }
      iconLink.href = appSettings.logo_url;
    }
  }, [appSettings]);

  return (
    <MasterDataContext.Provider
      value={{
        appSettings,
        villageHead,
        visionMission,
        geographics,
        officeInfo,
        loading,
        refreshMasterData,
      }}
    >
      {children}
    </MasterDataContext.Provider>
  );
}

export function useMasterData() {
  const context = useContext(MasterDataContext);
  if (!context) {
    return {
      appSettings: { app_name: 'Lapor Pak!', village_name: 'Desa Sukamaju', logo_url: null },
      villageHead: null,
      visionMission: null,
      geographics: null,
      officeInfo: null,
      loading: false,
      refreshMasterData: () => {},
    };
  }
  return context;
}
