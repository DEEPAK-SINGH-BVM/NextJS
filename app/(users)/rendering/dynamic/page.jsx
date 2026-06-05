import db from "@/config/db";
import {cache} from "react";
export const dynamic = "force-dynamic";

const DynamicPage = async () => {
  const user = await getAllUsers();
  // const [user] = await db.execute("SELECT * FROM user");
  // console.log("DynamicPage - Fetching userData");

  return (
    <>
      <UserList users={user} />
    </>
  );
};

export default DynamicPage;

const UserList = async (
  // { users }
) => {
  const users = await getAllUsers();
  // const [user] = await db.execute("SELECT * FROM user");
  // console.log("DynamicPage - Fetching userData");
  return (
    <ul>
      {users.map((item) => (
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


const getAllUsers = cache(async ()=>{
  const [user] = await db.execute("SELECT * FROM user");
  console.log("DynamicPage - Fetching userData");
  return user;  
});