import EventCard from "@/components/EventCard"
import { EventAttrs } from "@/database/event.model";
import { events } from "@/lib/constant"

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const page = async () => {
  
  const response = await fetch(`${BASE_URL}/api/events`);
  const {events} = await response.json();

  return (
    <section>
      <div className="text-center font-bold text-4xl">
        The hub for Every dev <br/> Event You Can't Miss
      </div>
      <p className="text-center mt-5">
        Hackathons, Meetups and Conferences, All in One Place
      </p>
      <div className="events flex flex-wrap justify-center gap-10 mt-10">
        {
          events && events.length > 0 && events.map((event : EventAttrs) => (
            <li key={event.title} className="list-none">
              <EventCard {...event} />
            </li>
          ))
        }
      </div>
    </section>
  )
}

export default page