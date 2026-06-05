import NotFound from "@/app/not-found";
import db from "@/config/db";

// export const dynamic = "force-dynamic";
export async function generateStaticParams() {

  // const [usersData] = await db.execute("SELECT * FROM user");
  // console.log("Users Data:", usersData);
  const [user] = await db.execute("SELECT id FROM user");
  //   for nextjs route params want string id, so we need to convert it to string
  return user.map((item) => ({ id: item.id.toString() }));
}
/*
npm run build
        ↓
generateStaticParams()
        ↓
IDs mil gaye
        ↓
Next.js har ID ke liye page generate karta hai
        ↓
ProductPage({ params })
        ↓
HTML static ban jata hai
*/
const getProductById = async (id) => {
  try {
    const [product] = await db.execute("SELECT * FROM user WHERE id = ?", [id]);
    return product[0];
  } catch (error) {
    console.error("Error fetching product by ID:", error);
    throw error;
  }
};

const ProductPage = async ({ params }) => {
  // console.log("ProductPage - Received params:", params);
  const { id } = await params;
  console.log("Fetching product with ID:", id);
  const product = await getProductById(id);
  if (!product) return <NotFound />;

  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Price: ${product.price.toFixed(2)}</p>
    </div>
  );
};

export default ProductPage;
