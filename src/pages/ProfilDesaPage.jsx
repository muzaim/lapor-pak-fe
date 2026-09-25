import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { useMasterData } from '../context/MasterDataContext';

export default function ProfilDesaPage() {
  const { section } = useParams();
  const activeSection = section || 'kepala-desa';
  const { 
    villageHead: contextHead, 
    visionMission: contextVision, 
    geographics: contextGeo, 
    appSettings: contextApp,
    officeInfo: contextOffice 
  } = useMasterData();

  const [masterData, setMasterData] = useState({
    village_head: null,
    vision_mission: null,
    geographics: null,
    app_settings: null,
  });

  const fetchMasterData = async () => {
    try {
      const res = await api.get('/master/all');
      const data = res.data?.data || res.data;
      if (data) {
        setMasterData(data);
      }
    } catch (err) {
      console.warn('GET /master/all fallback to defaults', err);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fetchMasterData();
  }, [section]);

  const villageHead = contextHead || masterData.village_head || {
    name: 'Bpk. H. Ahmad Sanusi',
    period: '2021 – 2027',
    description: 'Komitmen utama kami adalah menghadirkan pelayanan publik desa yang jujur, cepat, dan transparan bagi seluruh warga. Lewat sistem Lapor Pak!, setiap suara warga didengar dan ditindaklanjuti secara nyata.',
    photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80',
  };

  const visionMission = contextVision || masterData.vision_mission || {
    vision: 'Terwujudnya tata kelola desa yang transparan, maju, sejahtera, dan melayani masyarakat secara responsif.',
    mission: '1. Menyelenggarakan pelayanan publik berbasis digital secara transparan.\n2. Pembangunan infrastruktur dan pemeliharaan fasilitas umum merata.\n3. Memberdayakan ekonomi warga desa melalui penguatan UMKM lokal.\n4. Meningkatkan partisipasi aktif warga dalam pengawasan dan pembangunan desa.',
  };

  const geographics = contextGeo || masterData.geographics || {
    google_maps_url: 'https://maps.google.com/maps?q=-6.4862,106.8407&z=14&output=embed',
    border_north: 'Desa Nanggewer',
    border_south: 'Kelurahan Cirimekar',
    border_east: 'Desa Cibatok',
    border_west: 'Aliran Sungai Ciliwung',
    area_size: '450 Hektar',
    average_altitude: '180 mdpl',
    total_dusun: 5,
    topography: 'Dataran Rendah & Perbukitan Ringan',
  };

  const appSettings = contextApp || masterData.app_settings || {
    app_name: 'Lapor Pak!',
    village_name: 'Desa Sukamaju',
    logo_url: null,
  };

  const officeInfo = contextOffice || masterData.office_info || {
    office_address: 'Jl. Raya Desa Sukamaju No. 01, Kecamatan Cibinong, Kabupaten Bogor',
    operational_hours: 'Senin – Jumat: 08.00 – 16.00 WIB',
    operational_description: 'Sabtu & Minggu: Tutup (Pengaduan online tetap aktif 24 jam)',
    phone: '0812-3456-7890',
    email: 'kontak@desasukamaju.go.id',
  };

  // Format mission lines as list
  const missionItems = typeof visionMission.mission === 'string'
    ? visionMission.mission.split('\n').filter((item) => item.trim() !== '')
    : Array.isArray(visionMission.mission)
    ? visionMission.mission
    : [visionMission.mission];

  const formatEmbedUrl = (url) => {
    if (!url) return 'https://maps.google.com/maps?q=Kantor+Desa+Nglaban&z=15&output=embed';
    const iframeMatch = url.match(/src=["']([^"']+)["']/);
    if (iframeMatch && iframeMatch[1]) {
      return iframeMatch[1];
    }
    if (url.includes('output=embed') || url.includes('/maps/embed')) {
      return url;
    }
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      return 'https://maps.google.com/maps?q=Kantor+Desa+Nglaban&z=15&output=embed';
    }
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&output=embed`;
  };

  return (
    <div className="py-12 min-h-[calc(100vh-14rem)] text-slate-900 text-left">
      
      {/* 1. KEPALA DESA PAGE */}
      {activeSection === 'kepala-desa' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Left Photo */}
            <div className="md:col-span-5">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-md bg-slate-100">
                <img
                  src={villageHead.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80'}
                  alt={`Kepala Desa - ${villageHead.name}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&h=1000&q=80';
                  }}
                />
              </div>
            </div>

            {/* Right Details & Quote */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <span className="font-serif italic text-sky-700 font-medium text-base sm:text-lg">Kepala {appSettings.village_name || 'Desa'}</span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight font-serif mt-1">
                  {villageHead.name}
                </h1>
                {villageHead.period && (
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1.5">
                    Masa Jabatan: {villageHead.period}
                  </p>
                )}
              </div>

              {/* Profile Quote / Description */}
              {villageHead.description && (
                <div className="border-l-3 border-sky-600 pl-6 py-2">
                  <blockquote className="font-serif italic text-lg sm:text-xl text-slate-800 leading-relaxed whitespace-pre-line">
                    "{villageHead.description}"
                  </blockquote>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 2. VISI & MISI PAGE */}
      {activeSection === 'visi-misi' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Visi */}
            <div className="space-y-4">
              <span className="font-serif italic text-sky-700 font-medium text-base sm:text-lg">Pandangan Masa Depan</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-serif tracking-tight">
                Visi Desa
              </h2>
              <div className="pt-2 border-l-2 border-slate-900 pl-6">
                <p className="font-serif italic text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed">
                  "{visionMission.vision}"
                </p>
              </div>
            </div>

            {/* Right Misi */}
            <div className="space-y-4">
              <span className="font-serif italic text-sky-700 font-medium text-base sm:text-lg">Langkah Strategis</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-serif tracking-tight">
                Misi Desa
              </h2>
              <ol className="space-y-4 text-slate-700 text-base sm:text-lg leading-relaxed pt-2 font-normal">
                {missionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <span className="font-serif font-bold text-sky-700 shrink-0 text-xl sm:text-2xl">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="pt-0.5">{item.replace(/^\d+\.\s*/, '')}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* 3. LETAK GEOGRAFIS PAGE (FULL WIDTH) */}
      {activeSection === 'wilayah-desa' && (
        <section className="w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div>
              <span className="font-serif italic text-sky-700 font-medium text-base sm:text-lg">Peta & Batas Wilayah</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-serif tracking-tight mt-1">
                Letak Geografis
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-3xl leading-relaxed">
                Peta wilayah administratif dan informasi geografis resmi {appSettings.village_name || 'Desa'}.
              </p>
            </div>

            {/* FULL WIDTH GOOGLE MAPS EMBED */}
            <div className="w-full h-[400px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200 shadow-md">
              <iframe
                title="Peta Lokasi Desa"
                src={formatEmbedUrl(geographics.google_maps_url)}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

            {/* Direct Google Maps Link */}
            {geographics.google_maps_url && (
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-6">
                <a
                  href={geographics.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-bold text-sky-700 hover:text-sky-800 text-sm transition-colors"
                >
                  <span>Buka Lokasi Langsung di Google Maps</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Additional Geographic & Boundaries Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-slate-800 pt-2">
              <div className="space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950">Batas-Batas Wilayah</h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600">
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Utara:</span>
                    <span>{geographics.border_north || '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Selatan:</span>
                    <span>{geographics.border_south || '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Timur:</span>
                    <span>{geographics.border_east || '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Barat:</span>
                    <span>{geographics.border_west || '-'}</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-950">Statistik Administrasi</h3>
                <ul className="space-y-3 text-sm sm:text-base text-slate-600">
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Luas Wilayah Total:</span>
                    <span>{geographics.area_size || '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Ketinggian Rata-Rata:</span>
                    <span>{geographics.average_altitude || '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Jumlah Dusun:</span>
                    <span>{geographics.total_dusun !== undefined ? `${geographics.total_dusun} Dusun` : '-'}</span>
                  </li>
                  <li className="flex justify-between border-b border-slate-100 pb-2">
                    <span className="font-semibold text-slate-800">Topografi Wilayah:</span>
                    <span>{geographics.topography || '-'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. LOKASI & KONTAK PAGE */}
      {activeSection === 'lokasi-kontak' && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div>
              <span className="font-serif italic text-sky-700 font-medium text-base sm:text-lg">Layanan Administrasi</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-950 font-serif tracking-tight mt-1">
                Lokasi & Kontak Kantor Desa
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-2 max-w-xl leading-relaxed">
                Kantor {appSettings.village_name || 'Desa Sukamaju'} siap memberikan pelayanan administrasi dan menerima pengaduan warga.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-2">
              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-sky-700 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Alamat Kantor Desa</h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-1">
                      {officeInfo.office_address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3">
                  <Clock className="w-5 h-5 text-sky-700 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Jam Operasional</h3>
                    <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-1">
                      {officeInfo.operational_hours}
                      {officeInfo.operational_description && (
                        <span className="block text-xs text-slate-500 mt-1">{officeInfo.operational_description}</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-sky-700 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Hotline Telepon / WhatsApp</h3>
                    <p className="text-sm sm:text-base font-bold text-sky-700 mt-1">{officeInfo.phone}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3">
                  <Mail className="w-5 h-5 text-sky-700 shrink-0 mt-1" />
                  <div>
                    <h3 className="font-bold text-slate-950 text-base">Email Resmi</h3>
                    <a href={`mailto:${officeInfo.email}`} className="text-sm sm:text-base font-bold text-sky-700 hover:underline mt-1 inline-block">
                      {officeInfo.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
