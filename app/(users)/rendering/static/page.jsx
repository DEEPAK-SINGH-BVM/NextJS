import db from "@/config/db";
// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60;
const StaticPage = async () => {
  const [user] = await db.execute("SELECT * FROM user");
  console.log("StaticPage - userData", user);

  return (
    <div className="p-4">
    <h2>Static Page</h2>
    <ul>
      {user.map((item, index) => (
        <li key={item.id} className="list-item">
          <h3>{` ${index + 1} )`}</h3>
          <h3>{item.name}</h3>
          <p>Price: {item.price}</p>
          <p>{item.description}</p>
          <p>Category: {item.category}</p>
          <br />
        </li>
      ))}
    </ul>
    </div>
  );
};

export default StaticPage;
