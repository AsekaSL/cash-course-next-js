import EventCard from "@/components/EventCard"
import { events } from "@/lib/constant"


const page = () => {
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
          events.map((event) => (
            <li key={event.title}>
              <EventCard {...event} />
            </li>
          ))
        }
      </div>
    </section>
  )
}

export default page