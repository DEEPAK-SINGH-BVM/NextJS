import db from "@/config/db";
const staticPage = async () => {
  const [user] = await db.execute("SELECT * FROM user");
  //   console.log("userData", user);

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

export default staticPage;
