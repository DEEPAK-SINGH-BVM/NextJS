const DataCard = async ({ userName }) => {
  //   const searchParams = await props.searchParams;
  //   const username = searchParams.name;

  //   await new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve();
  //     }, 3000);
  //   });
  //   if (!username) {
  //     return <p>Please enter a name</p>;
  //   }
  //   let data = null;
  //   try {
  const res = await fetch(`https://api.genderize.io/?name=${userName}`);
  const data = await res.json();
  console.log("responseData", data);
  await new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 3000);
  });
  //   } catch (error) {
  //     console.error("error fetching data", error);
  //   }
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
      ) : ( */}
      <>
        <h1>Data Fetching </h1>
        Name : {data.name} <br /> Gender : {data.gender} <br /> Probability :{" "}
        {data.probability * 100}%
      </>
      {/*    )} */}
    </div>
  );
};

export default DataCard;
