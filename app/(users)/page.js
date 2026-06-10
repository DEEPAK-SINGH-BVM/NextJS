import Image from "next/image";
import image from "../../public/newImage.jpg";
export default function Home() {
  return (
    <div>
      <h1>Hello, Next.js!</h1>
      <Image
        src={image}
        width={100}
        height={100}
        alt="Picture of the author"
        className="rounded-lg"
        quality={10}
        // lazy loading is default for next/image, so we set it to false to load the image immediately
        priority={false}
        placeholder="blur"
        blurDataURL=""
      />
     
    </div>
  );
}
