import React, { useState } from "react";
import TradingViewChart from "./TradingViewChart";
import LimitOrderModal from "./LimitOrderModal";
import styles from "../styles/Trade.module.css";

interface Order {
  id: string;
  price: number;
  amount: number;
  type: "buy" | "sell";
}

const Trade: React.FC = () => {
  const [showLimitOrderModal, setShowLimitOrderModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  const symbol = "ethusdt";

  const handlePriceClick = (price: number) => {
    setSelectedPrice(price);
    setShowLimitOrderModal(true);
  };

  const handleLimitOrderSubmit = (order: {
    price: number;
    amount: number;
    type: "buy" | "sell";
  }) => {
    const newOrder: Order = {
      id: Date.now().toString(), // simple unique id
      ...order,
    };
    setOrders((prevOrders) => [...prevOrders, newOrder]);
    // ideally would send this order to an exchange API or route it internally
    console.log("Limit order placed:", newOrder);
  };

  const handleCancelAllOrders = () => {
    setOrders([]);
    // ideally would handle this with an API call
    console.log("All orders cancelled");
  };

  return (
    <>
      <div className={styles.tradeContainer}>
        <TradingViewChart
          onPriceClick={handlePriceClick}
          symbol={symbol}
          orders={orders}
          onCancelAllOrders={handleCancelAllOrders}
        />
      </div>
      {showLimitOrderModal && selectedPrice && (
        <LimitOrderModal
          price={selectedPrice}
          onClose={() => setShowLimitOrderModal(false)}
          onSubmit={handleLimitOrderSubmit}
        />
      )}
    </>
  );
};

export default Trade;
