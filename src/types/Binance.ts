import { CandlestickData, UTCTimestamp } from "lightweight-charts";

export interface BinanceKlineWSData {
  e: string;
  E: number;
  s: string;
  k: {
    t: number;
    T: number;
    s: string;
    i: string;
    f: number;
    L: number;
    o: string;
    c: string;
    h: string;
    l: string;
    v: string;
    n: number;
    x: boolean;
    q: string;
    V: string;
    Q: string;
    B: string;
  };
}

export interface BinanceKlineHistoricalData {
  openTime: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: UTCTimestamp;
  quoteAssetVolume: number;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: number;
  takerBuyQuoteAssetVolume: number;
  ignore: string;
}

export const fetchHistoricalData = async (symbol: string) => {
  const endpoint = `https://data-api.binance.vision/api/v3/klines?symbol=${symbol.toUpperCase()}&interval=1m`;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    return data.map((d: any) => binanceHistoricalDataToCandlestickData(d));
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
};

export const convertTimestamp = (timeMs: number): UTCTimestamp => {
  return Math.floor(timeMs / 1000) as UTCTimestamp;
};

export const binanceKlineDataToCandlestickData = (
  binanceData: BinanceKlineWSData
): CandlestickData => {
  return {
    time: convertTimestamp(binanceData.k.t),
    open: parseFloat(binanceData.k.o),
    high: parseFloat(binanceData.k.h),
    low: parseFloat(binanceData.k.l),
    close: parseFloat(binanceData.k.c),
  };
};

export const binanceHistoricalDataToCandlestickData = (
  binanceHistoricalData: any[]
): CandlestickData => {
  return {
    time: convertTimestamp(binanceHistoricalData[0]),
    open: parseFloat(binanceHistoricalData[1]),
    high: parseFloat(binanceHistoricalData[2]),
    low: parseFloat(binanceHistoricalData[3]),
    close: parseFloat(binanceHistoricalData[4]),
  };
};
