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
    <div className="p-4">
    <h2>Dynamic Page</h2>
    <ul>
      {users.map((item,index) => (
        
        <li className="list-item" key={item.id}>
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

// cache is used to cache the result of the function so if funcation call again same parameter then,
//  it  return  cached result instead of executing the function again, 
// this is useful for performance optimization and reducing the number of database calls.
const getAllUsers = cache(async ()=>{
  const [user] = await db.execute("SELECT * FROM user");
  console.log("DynamicPage - Fetching userData");
  return user;  
});
