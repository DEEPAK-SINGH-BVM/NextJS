import Navigation from "../../components/Navigation";

export const metadata = {
  title: {
    default: "My Next.js App",
    template: "%s | My Next.js App",
  },
  description: "This is the service page",
  authors: [
    { name: "John Doe", url: "https://example.com/johndoe" },
    { name: "Jane Doe", url: "https://example.com/janedoe" },
  ],
  keywords: ["service", "nextjs", "react"],
  icons: {
    icon: "/vercel.svg",
  },
};

const RootLayout = ({ children }) => {
  return (
    <>
      <Navigation />
      {children}
    </>
  );
};
export default RootLayout;
