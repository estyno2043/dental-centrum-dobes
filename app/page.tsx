import { ExperienceBand } from "@/components/home/ExperienceBand";
import { Hero } from "@/components/hero/Hero";
import { HomeStack } from "@/components/home/HomeStack";
import { PhotoStrip } from "@/components/home/PhotoStrip";

export default function HomePage() {
  return (
    <HomeStack
      hero={<Hero />}
      band={<ExperienceBand />}
      strip={<PhotoStrip />}
    />
  );
}
