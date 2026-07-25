export interface LeadershipMessage {
  id: string;
  title: string;
  salutation?: string;
  name: string;
  role: string;
  image: string;
  imageAlt?: string;
  highlights?: string[];
  content: string[];
}

export const leadershipMessages: LeadershipMessage[] = [
  {
    id: 'chairman-message',
    title: 'Message from the Chairman',
    salutation: 'Dear Alumni & Students,',
    name: 'Dr. Gurmeet Singh Dhaliwal',
    role: '(Chairman)',
    image: '/images/chairman.png',
    imageAlt: 'Dr. Gurmeet Singh Dhaliwal - Chairman BFGI',
    highlights: [
      'Bridging the Gap Between Alumni and Students',
      'Fostering a Lifelong Community of Learning',
      'Empowering Future Leaders through Shared Experiences',
    ],
    content: [
      'It gives me immense pleasure to welcome you to the Baba Farid Group of Institutions (BFGI) Alumni Portal. Our alumni are the true ambassadors of our institution, and this platform is dedicated to celebrating your achievements and maintaining our lifelong bond.',
      'This portal serves as a vibrant bridge between our distinguished alumni and our ambitious current students. We believe that the wisdom and industry experience of our alumni can immensely benefit our students. Here, you can seamlessly connect, share your professional journeys, and mentor the next generation of leaders.',
      'I strongly encourage our alumni to take the initiative in organizing events, webinars, and meetups through this platform, and I urge our students to actively attend them. Together, let us build a strong, collaborative community that drives innovation, excellence, and mutual growth.',
      'As you navigate your respective careers, remember that the values and ethos of BFGI travel with you. We are incredibly proud of your accomplishments and remain committed to supporting you in every possible way. May this portal foster enduring friendships and pave the way for extraordinary collaborations.',
    ],
  },
  {
    id: 'campus-director-message',
    title: 'Message from the Campus Director',
    salutation: 'Dear BFGI Family,',
    name: 'Prof. (Dr.) M.P. Poonia',
    role: 'Campus Director',
    image: '/images/director.png',
    imageAlt: 'Prof. (Dr.) M.P. Poonia - Campus Director BFGI',
    highlights: [
      'Building a Strong Mentorship Network',
      'Interactive Events and Knowledge Sharing',
      'Global Industry Connections',
    ],
    content: [
      'At BFGI, our vision extends far beyond the classroom. We are deeply committed to producing future innovators and leaders, and our alumni network is the cornerstone of this mission. This Alumni Portal is designed to foster meaningful interactions and professional networking.',
      'We have created this platform so that students can directly learn from the real-world experiences of those who once walked these same halls. Whether it is through organizing insightful events, offering career guidance, or simply sharing a success story, our alumni play a pivotal role in shaping the careers of our students.',
      'I invite all our alumni and students to actively engage with this platform. Host events, participate in discussions, and forge connections that will last a lifetime. Your journey with BFGI does not end at graduation—it simply evolves into a new, impactful chapter.',
      'Let us leverage this platform to build a vibrant ecosystem of knowledge sharing and mentorship. I am confident that with your continued association, our students will reach unprecedented heights and continue the legacy of excellence that defines our institution.',
    ],
  },
];
