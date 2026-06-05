import db from "@/config/db";
export const revalidate = 30;
const StaticPage = async () => {
  const [user] = await db.execute("SELECT * FROM user");
  // console.log("StaticPage - userData", user);

  return (
    <ul>
      {user.map((item) => (
        <li key={item.id} className="list-item">
          <h3>{item.name}</h3>
          <p>Price: {item.price}</p>
          <p>{item.description}</p>
          <p>Category: {item.category}</p>
        </li>
      ))}
    </ul>
  );
};

export default StaticPage;
