// for server component
const SingleUserPageId = async ({ params }) => {
  const { username, postId } = await params;
  console.log('username', username);
  console.log("postId", postId);
  return (
    <div>
      <h1>Name: {username}</h1>
      <p>Post Id: {postId}</p>
      <p>Server side Single User Page</p>
    </div>
  );
};
export default SingleUserPageId;
