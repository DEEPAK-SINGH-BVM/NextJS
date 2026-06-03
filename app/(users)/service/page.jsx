import React from "react";
import styles from "./service.module.css";

export const metadata = {
  title: "Service",
};

const Service = () => {
  return (
    <div>
      {/* 
      global css class
       <h1 className="serviceStyle">Service</h1>
      */}
      {/* css module   */}
      <h1 className={styles.serviceStyle}>Service</h1>
    </div>
  );
};

export default Service;
