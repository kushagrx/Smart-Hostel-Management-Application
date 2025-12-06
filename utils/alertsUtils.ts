export type AlertType = 'mess' | 'laundry' | 'payment' | 'maintenance' | 'event' | 'announcement';

export type Alert = {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  time: string;
  priority?: 'low' | 'medium' | 'high';
  actionable?: boolean;
};

export type PaymentReminder = {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'overdue' | 'paid';
  description: string;
};

export type Document = {
  id: string;
  name: string;
  category: 'rules' | 'policies' | 'forms' | 'other';
  uploadDate: Date;
  fileSize: string;
  fileUrl?: string;
};

export const personalizedAlerts: Alert[] = [
  {
    id: '1',
    type: 'mess',
    title: 'Mess Food',
    message: 'Chicken Biryani Tonight!',
    time: 'Today, 1:00 PM',
    priority: 'low'
  },
  {
    id: '2',
    type: 'laundry',
    title: 'Laundry',
    message: 'Your laundry is ready for pickup',
    time: 'Today, 11:00 AM',
    priority: 'medium',
    actionable: true
  },
  {
    id: '3',
    type: 'payment',
    title: 'Payment Reminder',
    message: 'Mess dues of ₹1500 are due',
    time: 'Today, 9:00 AM',
    priority: 'high',
    actionable: true
  },
];

export const paymentReminders: PaymentReminder[] = [
  {
    id: '1',
    title: 'Mess Dues',
    amount: 1500,
    dueDate: new Date('2025-02-28'),
    status: 'pending',
    description: 'Monthly mess fees for February'
  },
  {
    id: '2',
    title: 'Room Rent',
    amount: 5000,
    dueDate: new Date('2025-02-01'),
    status: 'overdue',
    description: 'February room rent'
  },
];

export const hostelDocuments: Document[] = [
  {
    id: '1',
    name: 'Hostel Rules & Regulations',
    category: 'rules',
    uploadDate: new Date('2024-01-15'),
    fileSize: '2.4 MB'
  },
  {
    id: '2',
    name: 'Guest Entry Policy',
    category: 'policies',
    uploadDate: new Date('2024-02-10'),
    fileSize: '1.8 MB'
  },
  {
    id: '3',
    name: 'Leave Application Form',
    category: 'forms',
    uploadDate: new Date('2024-03-05'),
    fileSize: '0.5 MB'
  },
  {
    id: '4',
    name: 'Fee Payment Policy',
    category: 'policies',
    uploadDate: new Date('2024-01-20'),
    fileSize: '3.2 MB'
  },
];