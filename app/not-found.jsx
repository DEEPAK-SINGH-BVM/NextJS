"use client";
import React from "react";
import { useRouter } from "next/navigation";
const NotFound = () => {
  const router = useRouter();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>404</h1>
      <h2 style={styles.subtitle}>Page Not Found</h2>
      <p style={styles.text}>
        The page you are looking for doesn’t exist or has been moved.
      </p>
      <div style={{ display: "flex", gap: "10px" }}>
      <button
        style={styles.button}
        onClick={() => (window.location.href = "/")}
      >
        Go Home
      </button>
      <br />
      <button style={styles.button2}
      onClick={()=>router.back()}
      >Go Back</button>
    </div>
    </div>
  );
};

const styles = {
  container: {
    height: "100vh",
    backgroundColor: "#0f172a",
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "20px",
  },
  title: {
    fontSize: "100px",
    margin: "0",
    color: "#38bdf8",
  },
  subtitle: {
    fontSize: "28px",
    margin: "10px 0",
  },
  text: {
    fontSize: "16px",
    color: "#94a3b8",
    marginBottom: "20px",
    maxWidth: "400px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#38bdf8",
    color: "#0f172a",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
    button2: {
    padding: "10px 20px",
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default NotFound;
