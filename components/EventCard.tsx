import { EventAttrs } from "@/database/event.model";
import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  title: string;
  image: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

const EventCard = ({title, image, slug, location, date, time}: EventAttrs) => {
  return (
    <Link href={`/events/${slug}`} id="event-card">
      <Image src={image} alt={title} width={300} height={150} />
      <p className="title">{title}</p>
      <p className="location">{location}</p>
      <p className="date">{date}</p>
      <p className="time">{time}</p>
    </Link>
  )
}

export default EventCard