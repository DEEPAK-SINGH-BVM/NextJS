"use client";
import { useParams } from "next/navigation";

const SingleUserPage = () => {
  const { username } = useParams();
  console.log("username-client", username);

  return (
    <div>
      <h1>{username}</h1>
      <p>Username: {username}</p>
      <p>Single User Page</p>
    </div>
  );
};

export default SingleUserPage;

// server
// const SingleUserPage = async ({ params }) => {
//   const { username } = await params;
//   console.log("username", username);
//   return (
//     <div>
//       <h1>{username}</h1>
//       <p>Username: {username}</p>
//       <p>Single User Page</p>
//     </div>
//   );
// };
// export default SingleUserPage;
