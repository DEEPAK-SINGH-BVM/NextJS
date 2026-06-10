// use for enable server action in this file. 
"use server";


import db from "@/config/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
// const contactAction = async (prevState, formData) => {
const contactAction = async (name, price, description, category) => {
  //   console.log("Form Data Received:", formData.entries());
  //   const name = formData.get("name");
  //   const price = formData.get("price");
  //   const description = formData.get("description");
  //   const category = formData.get("category");
  //   console.log("Extracted Data:", name, price, description, category);

  //    VALUES (?,?,?,?) this use karne se hum SQL injection se bach sakte hai, kyuki ye values ko parameterize karta hai aur unhe safely handle karta hai

  await db.execute(
    "INSERT INTO user (name,price,description,category) VALUES (?,?,?,?)",
    [name, price, description, category],
  );
  // console.log("Data inserted successfully!");
  // redirect("/");

  // revalidatePath("/") is used to re-render the page after the data is inserted into the database, so that we can see the updated data on the page without manually refreshing it.
  // revalidatePath("/");
  return { success: true, message: "Data Inserted successfully!" };
};
export default contactAction;
