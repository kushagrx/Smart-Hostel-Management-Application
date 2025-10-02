export type ComplaintPriority = 'low' | 'medium' | 'high' | 'emergency';

export type ComplaintStatus = 'open' | 'inProgress' | 'resolved' | 'closed';

export type Complaint = {
  id: string;
  title: string;
  description: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  messages: Message[];
};

export type Message = {
  id: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: Date;
};

export const emergencyContacts = [
  { name: 'Hostel Warden', number: '+91 98765 43210' },
  { name: 'Hostel Office', number: '+91 98765 43211' },
  { name: 'Bus Driver', number: '+91 98765 43212' },
];

export const faqData = [
  {
    question: 'What should I do in case of a medical emergency?',
    answer: 'Contact the hostel warden immediately or call our 24/7 medical emergency number. Medical assistance is available round the clock.'
  },
  {
    question: 'How do I report maintenance issues?',
    answer: 'Use the complaint system to raise a ticket. For urgent issues, mark the priority as high or emergency.'
  },
  // Add more FAQs
];