// import { ChartIcon, WalletIcon } from "@/components/icons";
// import { DrawingPinIcon, LightningBoltIcon, PersonIcon, RocketIcon, RulerSquareIcon, Share1Icon} from "@radix-ui/react-icons";
// import { BriefcaseBusiness, Building2, CalendarCheck2, CircleDollarSign, Home, UserRoundSearch, Users } from "lucide-react";
// import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa'
// import { FaXTwitter } from 'react-icons/fa6'

// export const socialMediaLinks = [
//   {
//     id: 1,
//     name: 'facebook',
//     url: 'https://www.facebook.com/profile.php?id=100093809678820',
//     icon: FaFacebookF,
//   },
//   {
//     id: 2,
//     name: 'twitter',
//     url: 'https://twitter.com/i/lists/1666911876943421440',
//     icon: FaXTwitter,
//   },
//   {
//     id: 3,
//     name: 'linkedin',
//     url: 'https://www.linkedin.com/company/alefteam/about',
//     icon: FaLinkedinIn,
//   },
// ]

// export const navLinks = [
//   {
//     href: "#about",
//     label: "About",
//   },
//   {
//     href: "#services",
//     label: "Services",
//   },
//   {
//     href: "#events",
//     label: "Events",
//   },
//   {
//     href: "#groups",
//     label: "Groups",
//   },
//   {
//     href: "#funding",
//     label: "Funding",
//   },
//   {
//     href: "#business",
//     label: "Business",
//   },
//   {
//     href: "#jobs",
//     label: "Jobs",
//   },
// ];

// export const dashboardNavLinks = [
//   {
//     href: "/home",
//     label: "Home",
//     icon: Home
//   },
//   {
//     href: "/user-search",
//     label: "Users",
//     icon: UserRoundSearch
//   },
//   {
//     href: "/business",
//     label: "Business",
//     icon: Building2
//   },
//   {
//     href: "/jobs",
//     label: "Jobs",
//     icon: BriefcaseBusiness
//   },
//   {
//     href: "/funding",
//     label: "Funding",
//     icon: CircleDollarSign
//   },
//   {
//     href: "/events",
//     label: "Events",
//     icon: CalendarCheck2
//   },
//   {
//     href: "/groups",
//     label: "Groups",
//     icon: Users
//   },
//   // {
//   //   href: "/messages",
//   //   label: "Messages",
//   //   icon: MessagesSquare
//   // },
// ];

// export const services = [
//   {
//     id: 1,
//     title: "Advertise Your Business",
//     description:
//       "Promote your business to the Business School Alumns community.",
//     icon: Share1Icon,
//   },
//   {
//     id: 2,
//     title: "Post a Job Offer",
//     description:
//       "Hire talented individuals from the Business School Alumns network.",
//     icon: RulerSquareIcon,
//   },
//   {
//     id: 3,
//     title: "Look for Work",
//     description:
//       "Explore job opportunities posted by fellow Business School Alumns.",
//     icon: LightningBoltIcon,
//   },
//   {
//     id: 4,
//     title: "Offer Funding",
//     description: "Provide financial support for projects or initiatives.",
//     icon: DrawingPinIcon,
//   },
//   {
//     id: 5,
//     title: "Raise Funding",
//     description: "Seek funding for your projects or ventures.",
//     icon: RocketIcon,
//   },
//   {
//     id: 6,
//     title: "Organise Meetings",
//     description: "Plan and coordinate meetings or events with ease.",
//     icon: PersonIcon,
//   },
// ];

// export const events = [
//   {
//     id: 1,
//     title: "Startup Pitch Night",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-06-15T19:00:00Z",
//     location: "Main Hall, University Campus",
//     zoom_link: null,
//     type: "inPerson",
//     image: "https://example.com/images/startup-pitch-night.jpg"
//   },
//   {
//     id: 2,
//     title: "Remote Coding Bootcamp",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-06-20T14:00:00Z",
//     location: "Online",
//     zoom_link: "https://zoom.us/j/1234567890",
//     type: "remote",
//     image: "https://example.com/images/remote-coding-bootcamp.jpg"
//   },
//   {
//     id: 3,
//     title: "Alumni Networking Event",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-07-05T18:00:00Z",
//     location: "City Conference Center",
//     zoom_link: null,
//     type: "inPerson",
//     image: "https://example.com/images/alumni-networking-event.jpg"
//   },
//   {
//     id: 4,
//     title: "Virtual Career Fair",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-07-10T10:00:00Z",
//     location: "Online",
//     zoom_link: "https://zoom.us/j/0987654321",
//     type: "remote",
//     image: "https://example.com/images/virtual-career-fair.jpg"
//   },
//   {
//     id: 5,
//     title: "Entrepreneurship Workshop",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-07-15T09:00:00Z",
//     location: "Innovation Lab, University Campus",
//     zoom_link: null,
//     type: "inPerson",
//     image: "https://example.com/images/entrepreneurship-workshop.jpg"
//   },
//   {
//     id: 6,
//     title: "Remote Marketing Seminar",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-08-01T16:00:00Z",
//     location: "Online",
//     zoom_link: "https://zoom.us/j/1122334455",
//     type: "remote",
//     image: "https://example.com/images/remote-marketing-seminar.jpg"
//   },
//   {
//     id: 7,
//     title: "Tech Conference 2024",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-08-15T09:00:00Z",
//     location: "Grand Auditorium, City Center",
//     zoom_link: null,
//     type: "inPerson",
//     image: "https://example.com/images/tech-conference-2024.jpg"
//   },
//   {
//     id: 8,
//     title: "Remote Leadership Webinar",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-08-25T11:00:00Z",
//     location: "Online",
//     zoom_link: "https://zoom.us/j/2233445566",
//     type: "remote",
//     image: "https://example.com/images/remote-leadership-webinar.jpg"
//   },
//   {
//     id: 9,
//     title: "Graduate Mixer",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-09-10T18:00:00Z",
//     location: "Alumni Hall, University Campus",
//     zoom_link: null,
//     type: "inPerson",
//     image: "https://example.com/images/graduate-mixer.jpg"
//   },
//   {
//     id: 10,
//     title: "Virtual Product Design Workshop",
//     description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna',
//     date: "2024-09-15T13:00:00Z",
//     location: "Online",
//     zoom_link: "https://zoom.us/j/3344556677",
//     type: "remote",
//     image: "https://example.com/images/virtual-product-design-workshop.jpg"
//   }
// ];

// export const fundingServices = [
//   // {
//   //   title: "Seed Funding",
//   //   description:
//   //     "Get initial capital to kickstart your innovative projects and ideas.",
//   //   icon: ChartIcon,
//   // },
//   {
//     title: "Venture Capital",
//     description:
//       "Coming Soon - Access significant investment to scale your business and reach new heights.",
//     icon: WalletIcon,
//   },
//   {
//     title: "Grants and Scholarships",
//     description:
//       "Coming Soon - Apply for grants and scholarships to support your business without repayment obligations.",
//     icon: ChartIcon,
//   },
// ];

// export const businesses = [
//   {
//     id: 1,
//     name: 'b1',
//     description: 'b1 description',
//     size: 'test',
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     visibility: 'visibility',
//     address: 'address',
//     phone: '15353113541853',
//     email: 'example@email.com',
//     less_than: true,
//     almuni_share: true,
//     date: 'Thu Jun 13 2024',
//     labels: ['label1', 'label2']
//   },
//   {
//     id: 2,
//     name: 'b2',
//     description: 'b2 description',
//     size: 'size',
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     visibility: 'visibility',
//     address: 'address',
//     phone: '15353113541853',
//     email: 'example@email.com',
//     less_than: true,
//     almuni_share: true,
//     date: 'Thu Jun 13 2024',
//     labels: ['label1', 'label2']
//   },
//   {
//     id: 3,
//     name: 'b3',
//     description: 'b3 description',
//     size: 'size',
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     visibility: 'visibility',
//     address: 'address',
//     phone: '15353113541853',
//     email: 'example@email.com',
//     less_than: true,
//     almuni_share: true,
//     date: 'Thu Jun 13 2024',
//     labels: ['label1', 'label2']
//   },
// ]

// export const jobs = [
//   {
//     id: 1,
//     title: 'job 1',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     country: 'Canada',
//     city: 'Ontario',
//     salary: '30$ per hour',
//     date: 'Thu Jun 13 2024',
//   },
//   {
//     id: 2,
//     title: 'job 2',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     country: 'Canada',
//     city: 'Ontario',
//     salary: '30$ per hour',
//     date: 'Thu Jun 13 2024',
//   },
//   {
//     id: 3,
//     title: 'job 3',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     country: 'Canada',
//     city: 'Ontario',
//     salary: '30$ per hour',
//     date: 'Thu Jun 13 2024',
//   },
// ]

// export const fundings = [
//   {
//     id: 1,
//     business: 'InnovateEdge Solutions',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     amount: '45000$',
//     date: 'Thu Jun 13 2024',
//   },
//   {
//     id: 2,
//     business: 'Visionary Ventures',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     amount: '8000$',
//     date: 'Thu Jun 13 2024',
//   },
//   {
//     id: 3,
//     business: 'SynergyWorks Group',
//     description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets",
//     occupation: 'occupation',
//     subOccupation: 'subOccupation',
//     amount: '2000$',
//     date: 'Thu Jun 13 2024',
//   },
// ]

// export const sidebarNavItems = [
//   // {
//   //   title: "Your Posts",
//   //   href: "posts",
//   // },
//   // {
//   //   title: "Your Connections",
//   //   href: "connection-list",
//   // },
//   // {
//   //   title: "Your Businesses",
//   //   href: "business",
//   // },
//   // {
//   //   title: "Your Jobs",
//   //   href: "jobs",
//   // },
//   // {
//   //   title: "Your Events",
//   //   href: "events",
//   // },
//   // {
//   //   title: "Your Groups",
//   //   href: "groups",
//   // },
//   {
//     title: "Update Profile",
//     href: "update-profile",
//   },
//   {
//     title: "Change Password",
//     href: "change-password",
//   },
// ]

export const companysizeData = [
  {
    id: 1,
    name: "1-10",
  },
  {
    id: 2,
    name: "11-50",
  },
  {
    id: 3,
    name: "51-200",
  },
  {
    id: 4,
    name: "201-500",
  },
  {
    id: 5,
    name: "501-1000",
  },
  {
    id: 6,
    name: "1000+",
  },
];

export const OCCUPATION_DATA = [
  {
    name: "information technology",
    sublist: [
      {
        name: "network administration",
      },
      {
        name: "software development",
      },
      {
        name: "database administration",
      },
      {
        name: "cloud computing",
      },
      {
        name: "cybersecurity",
      },
      {
        name: "artificial intelligence",
      },
      {
        name: "web development",
      },
      {
        name: "data analysis",
      },
    ],
  },
  {
    name: "finance",
    sublist: [
      {
        name: "investment banking",
      },
      {
        name: "corporate finance",
      },
      {
        name: "financial planning",
      },
      {
        name: "insurance",
      },
      {
        name: "accounting",
      },
      {
        name: "taxation",
      },
      {
        name: "venture capital",
      },
    ],
  },
  {
    name: "healthcare",
    sublist: [
      {
        name: "nursing",
      },
      {
        name: "physician",
      },
      {
        name: "physical therapy",
      },
      {
        name: "medical research",
      },
      {
        name: "occupational therapy",
      },
      {
        name: "pharmacy",
      },
      {
        name: "healthcare administration",
      },
    ],
  },
  {
    name: "education",
    sublist: [
      {
        name: "teaching",
      },
      {
        name: "curriculum development",
      },
      {
        name: "educational administration",
      },
      {
        name: "special education",
      },
      {
        name: "instructional design",
      },
      {
        name: "education technology",
      },
    ],
  },
  {
    name: "engineering",
    sublist: [
      {
        name: "civil engineering",
      },
      {
        name: "mechanical engineering",
      },
      {
        name: "electrical engineering",
      },
      {
        name: "chemical engineering",
      },
      {
        name: "software engineering",
      },
      {
        name: "aerospace engineering",
      },
      {
        name: "biomedical engineering",
      },
      {
        name: "environmental engineering",
      },
    ],
  },
  {
    name: "marketing",
    sublist: [
      {
        name: "digital marketing",
      },
      {
        name: "brand management",
      },
      {
        name: "public relations",
      },
      {
        name: "market research",
      },
      {
        name: "social media management",
      },
      {
        name: "product management",
      },
    ],
  },
  {
    name: "human resources",
    sublist: [
      {
        name: "talent acquisition",
      },
      {
        name: "employee relations",
      },
      {
        name: "compensation and benefits",
      },
      {
        name: "training and development",
      },
      {
        name: "organizational development",
      },
      {
        name: "diversity and inclusion",
      },
    ],
  },
  {
    name: "sales",
    sublist: [
      {
        name: "inside sales",
      },
      {
        name: "outside sales",
      },
      {
        name: "key account management",
      },
      {
        name: "retail sales",
      },
      {
        name: "sales operations",
      },
      {
        name: "business development",
      },
      {
        name: "channel sales",
      },
      {
        name: "sales engineering",
      },
    ],
  },
  {
    name: "health and fitness",
    sublist: [
      {
        name: "personal training",
      },
      {
        name: "yoga instruction",
      },
      {
        name: "group fitness instruction",
      },
      {
        name: "pilates instruction",
      },
      {
        name: "physical therapy",
      },
      {
        name: "nutrition counseling",
      },
      {
        name: "sports coaching",
      },
      {
        name: "massage therapy",
      },
    ],
  },
  {
    name: "arts and entertainment",
    sublist: [
      {
        name: "performing arts",
      },
      {
        name: "fine arts",
      },
      {
        name: "film and television",
      },
      {
        name: "music",
      },
      {
        name: "photography",
      },
      {
        name: "writing and editing",
      },
      {
        name: "graphic design",
      },
      {
        name: "animation and gaming",
      },
    ],
  },
  {
    name: "legal",
    sublist: [
      {
        name: "lawyer",
      },
      {
        name: "paralegal",
      },
      {
        name: "legal secretary",
      },
      {
        name: "court reporter",
      },
      {
        name: "legal consultant",
      },
      {
        name: "mediation and arbitration",
      },
      {
        name: "intellectual property",
      },
      {
        name: "compliance and ethics",
      },
    ],
  },
  {
    name: "customer service",
    sublist: [
      {
        name: "technical support",
      },
      {
        name: "customer success",
      },
      {
        name: "call center operations",
      },
      {
        name: "customer experience",
      },
    ],
  },
  {
    name: "Operations",
    sublist: [
      {
        name: "Supply chain management",
      },
      {
        name: "Logistics",
      },
      {
        name: "Procurement",
      },
      {
        name: "Project management",
      },
      {
        name: "Quality control",
      },
    ],
  },
  {
    name: "Creative",
    sublist: [
      {
        name: "Graphic design",
      },
      {
        name: "Video production",
      },
      {
        name: "Photography",
      },
      {
        name: "Animation",
      },
      {
        name: "Writing and editing",
      },
    ],
  },
  {
    name: "Media and Communications",
    sublist: [
      {
        name: "Journalism",
      },
      {
        name: "Public relations",
      },
      {
        name: "Broadcasting",
      },
      {
        name: "Advertising",
      },
      {
        name: "Content creation",
      },
    ],
  },
  {
    name: "Manufacturing",
    sublist: [
      {
        name: "Production Planning",
      },
      {
        name: "Quality Assurance",
      },
      {
        name: "Process Engineering",
      },
      {
        name: "Assembly",
      },
      {
        name: "Machining",
      },
      {
        name: "Packaging",
      },
      {
        name: "Maintenance and Repair",
      },
    ],
  },
];

export const VISIBILITY_DATA = ["public", "private", "hidden"];

export const COLLEGE_DATA = [
  {
    name: "All Souls College",
  },
  {
    name: "Balliol College",
  },
  {
    name: "Brasenose College",
  },
  {
    name: "Christ Church",
  },
  {
    name: "Corpus Christi College",
  },
  {
    name: "Exeter College",
  },
  {
    name: "Green Templeton College",
  },
  {
    name: "Harris Manchester College",
  },
  {
    name: "Hertford College",
  },
  {
    name: "Jesus College",
  },
  {
    name: "Keble College",
  },
  {
    name: "Kellogg College",
  },
  {
    name: "Lady Margaret Hall",
  },
  {
    name: "Linacre College",
  },
  {
    name: "Lincoln College",
  },
  {
    name: "Magdalen College",
  },
  {
    name: "Mansfield College",
  },
  {
    name: "Merton College",
  },
  {
    name: "New College",
  },
  {
    name: "Nuffield College",
  },
  {
    name: "Oriel College",
  },
  {
    name: "Pembroke College",
  },
  {
    name: "The Queen's College",
  },
  {
    name: "Regent's Park College",
  },
  {
    name: "St Anne's College",
  },
  {
    name: "St Antony's College",
  },
  {
    name: "St Catherine's College",
  },
  {
    name: "St Cross College",
  },
  {
    name: "St Edmund Hall",
  },
  {
    name: "St Hilda's College",
  },
  {
    name: "St Hugh's College",
  },
  {
    name: "St John's College",
  },
  {
    name: "St Peter's College",
  },
  {
    name: "Somerville College",
  },
  {
    name: "Trinity College",
  },
  {
    name: "University College",
  },
  {
    name: "Wadham College",
  },
  {
    name: "Wolfson College",
  },
  {
    name: "Worcester College",
  },
];

export const MATRICULATION_YEAR_DATA = [
  1950, 1951, 1952, 1953, 1954, 1955, 1956, 1957, 1958, 1959, 1960, 1961, 1962,
  1963, 1964, 1965, 1966, 1967, 1968, 1969, 1970, 1971, 1972, 1973, 1974, 1975,
  1976, 1977, 1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988,
  1989, 1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001,
  2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014,
  2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024,
];
