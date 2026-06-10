'use client';
import { usePathname } from "next/navigation";
import "./globals.css";
// import Navigation from "@/Components/Navigation";
import { Roboto, Work_Sans } from "next/font/google";
// import { Toaster } from "@/components/ui/sonner"
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <body className={`${roboto.variable} ${workSans.variable}`}>
        {/* {pathname !== "/about" && <Navigation />} */}
            {/* <Toaster  richColors/> */}
        {children}
      </body>
    </html>
  );
}
// export default function RootLayout ({children}){
//   return (
//     <html lang="en">
//       <body>
//         {/* <Navigation /> */}
//         {children}
//       </body>
//     </html>
//   )
// }

// /////////////////Extension 
/*
legacy Tabnine
Auto close tag
Auto rename tag
Bracket Pair color DLW
ES7 React/Redux/GraphQL/React-Native snippets
Git Patch
Image preview
Import Cost
indent-rainbow
json
Live Server
Material Icon Theme
Material-UI Snippets
Prettier - Code formatter
Prettify JSON
Tailwind CSS IntelliSense
 */