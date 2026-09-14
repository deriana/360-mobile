export interface WatermarkData {
  tpsId?: string;
  tpsNumber: number | string;
  village: string;
  district: string;
  regency: string;
  timestampWib: string;
  lat: number;
  lng: number;
  watermarkText: string;
}

export function generateWatermarkText(params: {
  tpsId?: string;
  tpsNumber?: number | string;
  village?: string;
  district?: string;
  regency?: string;
  lat?: number | null;
  lng?: number | null;
}): WatermarkData {
  const now = new Date();
  const timeWib = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
  const dateWib = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

  const latNum = params.lat ?? -6.8833;
  const lngNum = params.lng ?? 107.6167;
  const latStr = latNum.toFixed(5);
  const lngStr = lngNum.toFixed(5);

  const tpsNum = params.tpsNumber ?? '001';
  const villageName = (params.village ?? 'DAGO').toUpperCase();
  const districtName = params.district ?? 'Coblong';
  const regencyName = params.regency ?? 'Kota Bandung';

  const watermarkText = `[PAN BSN - TPS ${tpsNum} ${villageName} - ${dateWib} ${timeWib} - ${latStr}, ${lngStr}]`;

  return {
    tpsId: params.tpsId,
    tpsNumber: tpsNum,
    village: villageName,
    district: districtName,
    regency: regencyName,
    timestampWib: `${dateWib} ${timeWib}`,
    lat: latNum,
    lng: lngNum,
    watermarkText,
  };
}
