import React, { useState } from "react";
import styles from "../styles/LimitOrderModal.module.css";

interface LimitOrderModalProps {
  price: number;
  onClose: () => void;
  onSubmit: (order: {
    price: number;
    amount: number;
    type: "buy" | "sell";
  }) => void;
}
const LimitOrderModal: React.FC<LimitOrderModalProps> = ({
  price,
  onClose,
  onSubmit,
}) => {
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"buy" | "sell">("buy");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ price, amount: parseFloat(amount), type: orderType });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Place Limit Order</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="price">Price:</label>
            <input type="number" id="price" value={price} readOnly />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="amount">Amount:</label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Order Type:</label>
            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.orderTypeButton} ${
                  orderType === "buy" ? styles.active : ""
                }`}
                onClick={() => setOrderType("buy")}
              >
                Buy
              </button>
              <button
                type="button"
                className={`${styles.orderTypeButton} ${
                  orderType === "sell" ? styles.active : ""
                }`}
                onClick={() => setOrderType("sell")}
              >
                Sell
              </button>
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>
              Place Order
            </button>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LimitOrderModal;
