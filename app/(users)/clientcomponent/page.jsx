"use client";
import { useState, useEffect } from "react";

const clientComponent = () => {
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
      );
      const data = await response.json();
      // console.log("responseData", data);
      setData(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div>
      <h1>Client Component</h1>
      <button
        className="bg-blue-500 text-2xl text-amber-50"
        onClick={() => alert("Button clicked!")}
      >
        Click me
      </button>

      {data ? (
        <ul>
          {data.slice(0, 10).map((item) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};
export default clientComponent;
