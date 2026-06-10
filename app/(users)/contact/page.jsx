"use client";
import React, { useActionState, useState, useTransition } from "react";
import contactAction from "./contact.action";
//  useFormStatus is a Hook that gives you status information of the last form 
import { useFormStatus } from "react-dom";

// const contactAction = (formData) => {
//   const { name, price, description, category } = Object.fromEntries(
//     formData.entries(),
//   );
//   console.log("Client Data:", name, price, description, category);
// };

export default function contactForm() {
  // const [state, formAction, isPending] = useActionState(contactAction, null);
  // console.log("State after form submission:", state);

  const [isPending, startTransition] = useTransition();
  const [product, setProduct] = useState(null);
  console.log("Product:", product);

  const handleProductSubmit = async (formData) => {
    console.log("FormData Step-1:", formData);
    console.log("FormData Step-2:", Object.fromEntries(formData));
    const { name, price, description, category } = Object.fromEntries(formData);
    console.log("Client Data:", name, price, description, category);

    startTransition(async () => {
      const res = await contactAction(name, price, description, category);
      setProduct(res);
    });
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form
        className="w-full max-w-md bg-gray-900 p-6 rounded-2xl shadow-lg space-y-5"
        // action={contactAction}
        // action={formAction}
        action={handleProductSubmit}
      >
        {/* Title */}
        <h2 className="text-white text-2xl font-semibold text-center">
          Add Product
        </h2>

        {/* Name */}
        <div>
          <label htmlFor="name" className="text-gray-300 text-sm">
            Product Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="Enter product name"
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label htmlFor="price" className="text-gray-300 text-sm">
            Price
          </label>
          <input
            id="price"
            name="price"
            type="number"
            required
            placeholder="Enter product price"
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="text-gray-300 text-sm">
            Category
          </label>
          <input
            id="category"
            name="category"
            type="text"
            required
            placeholder="Enter category"
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="text-gray-300 text-sm">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows="4"
            placeholder="Enter product description"
            className="w-full mt-1 p-2 rounded-lg bg-gray-800 text-white outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Button */}
        <Submit />
        <section>
          {product && (
            <p
              className={`p-4 text-center mt-4 ${product.success ? "text-green-500 bg-green-900" : "text-red-500 bg-red-900"}`}
            > 
              {product.message}
            </p>
          )}
        </section>
        {/* <section>
          {state && (
            <p
              className={`p-4 text-center mt-4 ${state.success ? "text-green-500 bg-green-900" : "text-red-500 bg-red-900"}`}
            >
              {state.message}
            </p>
          )}
        </section> */}
      </form>
    </div>
  );
}

const Submit = () => {
  const { pending, data, method, action } = useFormStatus();
  console.log("Form Status - Pending:", pending, "Data:", data, "Method:", method, "Action:", action);
  return (
    <>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
      >
        {pending ? "loading..." : "Submit"}
      </button>
    </>
  );
};
