// ROMANOV RECORDS — main page
// Section order: Hero → Tariffs → Equipment → Location+Contacts → Comfort
// No WaveDividers — sections flow as one continuous tape on a shared dot-grid background
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import Tariffs from "@/components/Tariffs";
import Equipment from "@/components/Equipment";
import Location from "@/components/Location";
import Comfort from "@/components/Comfort";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Tariffs />
        <Equipment />
        <Location />
        <Comfort />
      </main>
    </>
  );
}
