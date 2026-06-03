"use client";
import { useSearchParams } from "next/navigation";

const ProductList = () => {
  const searchParams = useSearchParams();
  console.log("searchParams-client", searchParams);

  const category = searchParams.getAll("category");
  console.log("category-client", category);

  const sort = searchParams.get("sort");
  console.log("sort-client", sort);

  return (
    <div>
      <h1>Product List</h1>
    </div>
  );
};

export default ProductList;
