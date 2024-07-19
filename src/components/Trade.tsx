import React, { useState } from "react";
import TradingViewChart from "./TradingViewChart";
import LimitOrderModal from "./LimitOrderModal";
import styles from "../styles/Trade.module.css";

const Trade: React.FC = () => {
  const [showLimitOrderModal, setShowLimitOrderModal] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<number | null>(null);
  // Symbol for the trading pair, hardcoded for demo purposes
  const symbol = "ethusdt";

  const handlePriceClick = (price: number) => {
    setSelectedPrice(price);
    setShowLimitOrderModal(true);
  };

  const handleLimitOrderSubmit = (order: { price: number; amount: number }) => {
    console.log("Limit order placed:", order);
    // Here you would typically send the order to your backend
  };

  return (
    <div className={styles.tradeContainer}>
      <TradingViewChart onPriceClick={handlePriceClick} symbol={symbol} />
      {showLimitOrderModal && selectedPrice && (
        <LimitOrderModal
          price={selectedPrice}
          onClose={() => setShowLimitOrderModal(false)}
          onSubmit={handleLimitOrderSubmit}
        />
      )}
    </div>
  );
};

export default Trade;
