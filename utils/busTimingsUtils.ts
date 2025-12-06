export type BusRoute = {
  id: string;
  route: string;
  times: string[];
};

export const busTimings: BusRoute[] = [
  {
    id: '1',
    route: 'Hostel to College',
    times: ['8:45 AM', '9:45 AM', '10:45 AM', '11:45 AM', '12:45 PM', '1:45 PM', '2:45 PM', '3:45 PM', '4:45 PM']
  },
  {
    id: '2',
    route: 'College to Hostel',
    times: ['9:20 AM','10:20 AM','11:20 AM','12:20 PM','1:20 PM','2:20 PM','3:20 PM','4:20 PM','5:20 PM']
  }
];

export type RoomService = {
  id: string;
  name: string;
  description: string;
  available: boolean;
  icon: string;
};

export const roomServices: RoomService[] = [
  {
    id: '1',
    name: 'Room Cleaning',
    description: 'Regular cleaning and housekeeping service',
    available: true,
    icon: 'broom'
  },
  {
    id: '2',
    name: 'Laundry Service',
    description: 'Clothes washing and ironing',
    available: true,
    icon: 'washing-machine'
  },
  {
    id: '3',
    name: 'Maintenance',
    description: 'Repair and maintenance issues',
    available: true,
    icon: 'wrench'
  },
  {
    id: '4',
    name: 'Room Shift',
    description: 'Request to change your room',
    available: true,
    icon: 'home-switch-outline'
  },
  {
    id: '5',
    name: 'Wi-Fi Support',
    description: 'Internet connectivity issues',
    available: true,
    icon: 'wifi'
  },
  {
    id: '6',
    name: 'Guest Accommodation',
    description: 'Arrange guest room/accommodation',
    available: false,
    icon: 'account-multiple'
  },
];