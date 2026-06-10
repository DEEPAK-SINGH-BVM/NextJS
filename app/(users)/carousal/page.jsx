"use client";
import { Card, CardContent } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";

const page = () => {
  return (
    <div className="flex items-center justify-center pt-3.5">
      <Carousel
        className="w-full max-w-48 sm:max-w-xs md:max-w-sm"
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent className="-ml-1">
          {Array.from({ length: 10 }).map((_, index) => (
            <CarouselItem key={index} className="basis-1/2 pl-1 lg:basis-1/3">
              <div className="p-1">
                <Card>
                  <CardContent className="flex aspect-square items-center justify-center">
                    {/* <span className="text-2xl font-semibold">{index + 1}</span> */}
                    <Image
                      src="https://images.pexels.com/photos/35802444/pexels-photo-35802444.jpeg"
                      width={250}
                      height={250}
                    />
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </div>
  );
};

export default page;
