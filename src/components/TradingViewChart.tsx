import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  CandlestickData,
  ChartOptions,
  DeepPartial,
  MouseEventParams,
  ISeriesApi,
  ColorType,
  Time,
  UTCTimestamp,
  IPriceLine,
} from "lightweight-charts";
import styles from "../styles/TradingViewChart.module.css";

interface TradingViewChartProps {
  onPriceClick: (price: number) => void;
  symbol: string;
  orders: Array<{ id: string; price: number; type: "buy" | "sell" }>;
  onCancelAllOrders: () => void;
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

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  onPriceClick,
  symbol,
  orders,
  onCancelAllOrders,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orderLinesRef = useRef<Map<string, IPriceLine>>(new Map());

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const convertTimestamp = useCallback((timeMs: number): UTCTimestamp => {
    return Math.floor(timeMs / 1000) as UTCTimestamp;
  }, []);

  const binanceKlineDataToCandlestickData = (
    binanceData: BinanceKlineData
  ): CandlestickData => {
    return {
      time: convertTimestamp(binanceData.k.t),
      open: parseFloat(binanceData.k.o),
      high: parseFloat(binanceData.k.h),
      low: parseFloat(binanceData.k.l),
      close: parseFloat(binanceData.k.c),
    };
  };

  useEffect(() => {
    if (!chartContainerRef.current) return;

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
        barSpacing: 10,
      },
    };

    const chart = createChart(chartContainerRef.current, chartOptions);
    const candlestickSeries = chart.addCandlestickSeries();

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

    const resizeObserver = new ResizeObserver((entries) => {
      if (
        entries.length === 0 ||
        entries[0].target !== chartContainerRef.current
      )
        return;
      const newRect = entries[0].contentRect;
      chart.applyOptions({ width: newRect.width, height: newRect.height });
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      // Clear all order lines before removing the chart
      orderLinesRef.current.forEach((line) => {
        candlestickSeries.removePriceLine(line);
      });
      orderLinesRef.current.clear();
      chart.remove();
    };
  }, []);

  // Update order lines when orders change
  useEffect(() => {
    if (!seriesRef.current) return;

    // Remove old lines
    orderLinesRef.current.forEach((line, id) => {
      if (!orders.some((order) => order.id === id)) {
        seriesRef.current?.removePriceLine(line);
        orderLinesRef.current.delete(id);
      }
    });

    // Add or update lines
    orders.forEach((order) => {
      if (orderLinesRef.current.has(order.id)) {
        const line = orderLinesRef.current.get(order.id)!;
        line.applyOptions({
          price: order.price,
          color: order.type === "buy" ? "green" : "red",
          title: `${order.type.toUpperCase()} ${order.price}`,
        });
      } else {
        const line = seriesRef.current?.createPriceLine({
          price: order.price,
          color: order.type === "buy" ? "green" : "red",
          lineWidth: 2,
          lineStyle: 1,
          axisLabelVisible: true,
          title: `${order.type.toUpperCase()} ${order.price}`,
        });
        if (line) {
          orderLinesRef.current.set(order.id, line);
        }
      }
    });

    return () => {
      if (seriesRef.current) {
        orderLinesRef.current.forEach((line) => {
          seriesRef.current?.removePriceLine(line);
        });
        orderLinesRef.current.clear();
      }
    };
  }, [orders]);

  useEffect(() => {
    const connectWebSocket = () => {
      if (
        wsRef.current &&
        (wsRef.current.readyState === WebSocket.OPEN ||
          wsRef.current.readyState === WebSocket.CONNECTING)
      ) {
        return;
      }

      const ws = new WebSocket(
        `wss://data-stream.binance.vision:443/ws/${symbol}@kline_1m`
      );

      ws.onopen = () => {
        console.log("WebSocket connected");
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: BinanceKlineData = JSON.parse(event.data);
          const candleStickData = binanceKlineDataToCandlestickData(data);
          if (seriesRef.current) {
            seriesRef.current.update(candleStickData);
          }
        } catch (error) {
          console.error("Error parsing WebSocket data:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason);
        wsRef.current = null;
        reconnectTimeoutRef.current = setTimeout(connectWebSocket, 5000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [binanceKlineDataToCandlestickData]);

  return (
    <div className={styles.chartWrapper}>
      <h2 className={styles.symbolHeading}>Trading: {symbol.toUpperCase()}</h2>
      <div className={styles.chartContainer}>
        <div ref={chartContainerRef} className={styles.chart} />
      </div>
      <button className={styles.cancelAllButton} onClick={onCancelAllOrders}>
        Cancel All Orders
      </button>
    </div>
  );
};

export default TradingViewChart;
