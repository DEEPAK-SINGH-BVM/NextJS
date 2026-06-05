"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const DataFetching = () => {
  const searchParams = useSearchParams();
  const username = searchParams.get("name");
  console.log("username-client", username);

  const [data, setData] = useState(null);

  if (!username) {
    return <p>Please enter a name</p>;
  }
  const fetchData = async () => {
    try {
      const res = await fetch(`https://api.genderize.io/?name=${username}`);
      const data = await res.json();
      // console.log("responseData", data);
      setData(data);
    } catch (error) {
      console.error("error fetching data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (data?.error) {
    return (
      <div>
        <h1>Data Fetching</h1>
        <p>Error from API: {data.error}</p>
      </div>
    );
  }
  return (
    <div>
      {/* {!username ? (
        <p>Please enter a name</p>
      ) : (
        <>
          <h1>Data Fetching </h1>
          Name : {data.name} <br /> Gender : {data.gender} <br /> Probability :{" "}
          {data.probability * 100}%
        </>
      )} */}
      <h1>Data Fetching</h1>
      {username}
    </div>
  );
};

export default DataFetching;
