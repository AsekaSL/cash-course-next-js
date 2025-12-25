import BookEvent from "@/components/BookEvent";
import EventCard from "@/components/EventCard";
import { EventAttrs } from "@/database/event.model";
import { getSimilarEventsBySlug } from "@/lib/actions/event.actions";
import Image from "next/image";
import { notFound } from "next/navigation";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ;

const  EventDetailItem = ({ icon, alt, label} : { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
)

const EventDetailsPage = async ({params} : {params: Promise<{ slug: string }>} ) => {

  const {slug} = await params;

  const request = await fetch(`${BASE_URL}/api/events/${slug}`);
  const {response: {description, image, overview, data, time, location, mode, agenda, audience, organizer, tags}} = await request.json();

  if (!description) {
    return notFound()
  }

const EventAgenda = ({agendaItems} : {agendaItems: string[]}) => (
  <div>
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
)


const  EventTags = ({tags} : {tags: string[]}) => (
  <div className="flex flex-row-gap-2 items-center">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
)

const booking = 10;

const similarEvents = await getSimilarEventsBySlug(slug);

  return (
    <section id="event">
      <div className="header"> 
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* Left Side */}
        <div className="content">
          <Image src={image} alt="Event Banner" width={800} height={800} className="banner" />
          <section className="flex-col-gap-2">
            <h2>Overview</h2>
            <h2>{overview}</h2>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Detials</h2>
            <EventDetailItem icon="/icons/calender.svg" alt="calender" label={data} />
            <EventDetailItem icon="/icons/clocl.svg" alt="clocl" label={time} />
            <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location} />
            <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience} />
          </section>  

          <EventAgenda agendaItems={agenda[0]} />

          <section className="flex-row-gap-2">
            <h2>About Organizer</h2>
            <p>{organizer}</p>
          </section>

          <EventTags tags={JSON.parse(tags[0])} />

        </div>



        {/* Right Side */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Book Your Spot</h2>
            {booking > 0 ? (
              <p> Join {booking} people who already booked their spot!</p>
            ) : (
              <p className="text-sm">Be the first to book your spot!</p>
            )}

            <BookEvent slug={slug} />
          </div>
        </aside>
      </div>

      <div>
        <h2>Similar Events</h2>
        <div>
          {similarEvents.length > 0 && similarEvents.map((similarEvents: EventAttrs) => (
            <EventCard {...similarEvents} key={similarEvents.title}/>
          ))}
        </div>
      </div>

    </section>  

)}
  

export default EventDetailsPage
