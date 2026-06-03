import { Suspense } from "react";
import DataCard from "./DataCard";

const DataFetching = async (props) => {
  const searchParams = await props.searchParams;
  const userName = searchParams.name;

  if (!userName) {
    return <p>Please enter a name</p>;
  }
  return (
    <div>
      <div className="p-4">
        <h1>
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quaerat
          sequi <br />
          dolore ex fugit aspernatur velit voluptate repellendus dolores quis{" "}
          <br />
          placeat! Amet aperiam quasi inventore explicabo perspiciatis in <br />
          veritatis odit incidunt! Lorem ipsum dolor sit amet consectetur
          <br />
          adipisicing elit. Illo sit hic beatae repellat iure nihil ab
          <br />
          exercitationem consectetur? Error, quod neque. Vero quae ipsa
          laudantium
          <br />
          omnis? Tempore possimus aperiam quam.
        </h1>
        <br />
        <br />
        <h1>User Data</h1>
        <Suspense fallback={<div>....Loading </div>}>
          <DataCard userName={userName} />
        </Suspense>
      </div>
    </div>
  );
};

export default DataFetching;
