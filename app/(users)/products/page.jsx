import ProductList from "./ProductList";

// const allProducts = [
//   { id: 1, name: "iPhone", category: "mobile", price: 1000 },
//   { id: 2, name: "Samsung", category: "mobile", price: 800 },
//   { id: 3, name: "Nike Shoes", category: "shoes", price: 200 },
// ];

const page = async ({ searchParams }) => {
  const searchParam = await searchParams;
  //   console.log("searchParams", searchParams);
  const category = searchParam.category || "all";
  console.log("category", category);
  const sort = searchParam.sort || "default";
  console.log("sort", sort);
  const page = searchParam.page || 1;
  console.log("page", page);

  // const filteredProducts = allProducts
  //   .filter((p) => {
  //     return category === "all" || p.category === category;
  //   })
  //   .sort((a, b) => {
  //     if (sort === "price-asc") return a.price - b.price;
  //     if (sort === "price-desc") return b.price - a.price;
  //     return 0;
  //   })
  //   .slice((page - 1) * 10, page * 10);
  return (
    <div>
      <h1>Products Page</h1>
      <ProductList />
      <p>
        Product category was {category}, sort by {sort}, page {page}
      </p>
      <br />
      {/* {filteredProducts.length > 0 ? (
        <ul>
          {filteredProducts.map((p) => (
            <li key={p.id}>
              {p.name} - ${p.price}
            </li>
          ))}
        </ul>
      ) : (
        <p>No products found.</p>
      )} */}
    </div>
  );
};

export default page;
