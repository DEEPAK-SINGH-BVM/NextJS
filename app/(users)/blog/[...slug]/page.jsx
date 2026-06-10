const Blog = async (props) => {
  console.log("props", props);
  const { slug } = await props.params;
  console.log("slug", slug);

  return <div>Blog</div>;
}; 

export default Blog;