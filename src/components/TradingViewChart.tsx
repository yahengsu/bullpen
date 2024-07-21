import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  createChart,
  ChartOptions,
  DeepPartial,
  MouseEventParams,
  ISeriesApi,
  ColorType,
  Time,
  IPriceLine,
} from "lightweight-charts";
import styles from "../styles/TradingViewChart.module.css";
import {
  binanceKlineDataToCandlestickData,
  BinanceKlineWSData,
  fetchHistoricalData,
} from "@/types/Binance";

interface TradingViewChartProps {
  onPriceClick: (price: number) => void;
  symbol: string;
  orders: Array<{ id: string; price: number; type: "buy" | "sell" }>;
  onCancelAllOrders: () => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  onPriceClick,
  symbol,
  orders,
  onCancelAllOrders,
}) => {
  const chartContainerRef = useRef(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const orderLinesRef = useRef<Map<string, IPriceLine>>(new Map());
  const isChartVisibleRef = useRef(true);

  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  const connectWebSocket = useCallback(() => {
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
        const data: BinanceKlineWSData = JSON.parse(event.data);
        const candleStickData = binanceKlineDataToCandlestickData(data);
        if (seriesRef.current && isChartVisibleRef.current) {
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
  }, [symbol]);

  useEffect(() => {
    const initChart = async () => {
      if (!chartContainerRef.current) return;

      isChartVisibleRef.current = true;

      const chartOptions: DeepPartial<ChartOptions> = {
        height: 400,
        layout: {
          background: { type: ColorType.Solid, color: "#111111" },
          textColor: "#fff",
        },
        grid: {
          vertLines: { color: "#333" },
          horzLines: { color: "#333" },
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
      chart.timeScale().fitContent();

      const historicalData = await fetchHistoricalData(symbol);
      const candlestickSeries = chart.addCandlestickSeries();
      candlestickSeries.setData(historicalData);
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
        isChartVisibleRef.current = false;
        // Clear all order lines before removing the chart
        orderLinesRef.current.forEach((line) => {
          candlestickSeries.removePriceLine(line);
        });
        orderLinesRef.current.clear();
        chart.remove();
      };
    };

    initChart();
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      isChartVisibleRef.current = !document.hidden;
      if (document.hidden) {
        if (wsRef.current) {
          wsRef.current.close();
          wsRef.current = null;
        }
      } else {
        connectWebSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
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
    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

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
