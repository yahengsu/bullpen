import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickData,
  ChartOptions,
  DeepPartial,
  MouseEventParams,
  ISeriesApi,
  SeriesOptionsCommon,
  CandlestickSeriesOptions,
  ColorType,
  Time,
  UTCTimestamp,
} from "lightweight-charts";
import styles from "../styles/TradingViewChart.module.css";

interface TradingViewChartProps {
  symbol: string;
  onPriceClick: (price: number) => void;
}

interface BinanceKlineData {
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

const binanceKlineDataToCandlestickData = (
  binanceData: BinanceKlineData
): CandlestickData => {
  return {
    time: Math.floor(binanceData.k.t / 1000) as UTCTimestamp,
    open: parseFloat(binanceData.k.o),
    high: parseFloat(binanceData.k.h),
    low: parseFloat(binanceData.k.l),
    close: parseFloat(binanceData.k.c),
  };
};

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  onPriceClick,
  symbol,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chartOptions: DeepPartial<ChartOptions> = {
        width: chartContainerRef.current.clientWidth,
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: "#ffffff" },
          textColor: "#333",
        },
        grid: {
          vertLines: { color: "#f0f0f0" },
          horzLines: { color: "#f0f0f0" },
        },
        crosshair: {
          mode: 1,
        },
        timeScale: {
          borderColor: "#cccccc",
          timeVisible: true,
          secondsVisible: false,
        },
      };

      const chart = createChart(chartContainerRef.current, chartOptions);

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#26a69a",
        downColor: "#ef5350",
        borderVisible: false,
        wickUpColor: "#26a69a",
        wickDownColor: "#ef5350",
      });

      chartRef.current = chart;
      seriesRef.current = candlestickSeries;

      chart.subscribeCrosshairMove((param: MouseEventParams<Time>) => {
        if (param.point && param.time && seriesRef.current) {
          const price = seriesRef.current.coordinateToPrice(param.point.y);
          if (price !== null) {
            setCurrentPrice(price);
          }
        } else {
          setCurrentPrice(null);
        }
      });

      chart.subscribeClick((param: MouseEventParams<Time>) => {
        if (param.point && param.time && seriesRef.current) {
          const price = seriesRef.current.coordinateToPrice(param.point.y);
          if (price !== null) {
            onPriceClick(price);
          }
        }
      });

      return () => {
        chart.remove();
      };
    }
  }, [onPriceClick]);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://data-stream.binance.vision:443/ws/${symbol}@kline_1m`
    );

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data: BinanceKlineData = JSON.parse(event.data);
        const candlestickData = binanceKlineDataToCandlestickData(data);
        if (seriesRef.current) {
          seriesRef.current.update(candlestickData);
        }
      } catch (error) {
        console.error("Error parsing WebSocket data:", error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  return (
    <div className={styles.chartContainer}>
      <div className={styles.symbolTitle}>{symbol}</div>
      <div ref={chartContainerRef} className={styles.chart} />
      {currentPrice && (
        <div className={styles.priceOverlay}>
          Current Price: {currentPrice.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;
