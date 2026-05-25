// Dasha 数据类型定义

export interface Sookshma {
  name: string;
  start: string;
  end?: string;
}

export interface Pratyantardasha {
  name: string;
  start: string;
  end: string;
  duration: number;
  sookshma?: Sookshma[];
}

export interface Antardasha {
  name: string;
  start: string;
  end: string;
  duration: number;
  pratyantardashas?: Pratyantardasha[];
}

export interface Mahadasha {
  name: string;
  start: string;
  end: string;
  duration: number;
}

export interface DashaData {
  mahadasha?: Mahadasha;
  antardasha?: Antardasha[];
  upcoming?: Mahadasha[];
}

export interface ChartResult {
  dasha?: DashaData;
  // 其他属性...
}
