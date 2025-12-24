export interface EventItem {
  image: string;
  title: string;
  slug: string;
  location: string;
  date: string;
  time: string;
}

export const events: EventItem[] = [
  {
    image: '/react-summit.svg',
    title: 'React Summit',
    slug: 'react-summit-2026',
    location: 'Amsterdam, Netherlands',
    date: '2026-03-20',
    time: '09:00 – 18:00'
  },
  {
    image: '/nextjs-conf.svg',
    title: 'Next.js Conf',
    slug: 'nextjs-conf-2026',
    location: 'Online',
    date: '2026-04-15',
    time: '10:00 – 17:00 (UTC)'
  },
  {
    image: '/jsconf-eu.svg',
    title: 'JSConf EU',
    slug: 'jsconf-eu-2026',
    location: 'Kraków, Poland',
    date: '2026-05-06',
    time: '09:30 – 17:30'
  },
  {
    image: '/hackmit.svg',
    title: 'HackMIT',
    slug: 'hackmit-2026',
    location: 'Cambridge, MA, USA',
    date: '2026-09-19',
    time: '18:00 – 12:00 (next day)'
  },
  {
    image: '/vue-amsterdam.svg',
    title: 'Vue.js Amsterdam',
    slug: 'vue-amsterdam-2026',
    location: 'Amsterdam, Netherlands',
    date: '2026-06-10',
    time: '09:00 – 17:00'
  }
];

