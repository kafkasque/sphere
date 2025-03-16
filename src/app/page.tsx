import Image from "next/image";
import { DynamicIsland } from "@/components/global/dynamic-island";
export default function Home() {
  return (
    <>
      <DynamicIsland isScrolling={false}/>
    </>
  );
}
