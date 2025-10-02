export type MenuItem = {
  dish: string;
  type: 'veg' | 'non-veg';
  highlight?: boolean; // For special items
};

export type MealType = {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  snacks: MenuItem[];
  dinner: MenuItem[];
};

export const currentWeekMenu: Record<string, MealType> = {
  'Monday': {
    breakfast: [
      { dish: 'Aloo Paratha', type: 'veg' },
      { dish: 'Dahi', type: 'veg' },
      { dish: 'Bread, Butter, Jam', type: 'veg' },
      { dish: 'Tea/Milk', type: 'veg' },
    ],
    lunch: [
      { dish: 'Urad Chana Dal', type: 'veg' },
      { dish: 'Mix Veg, Raita', type: 'veg' },
      { dish: 'Rice, Desi Ghee Roti', type: 'veg' },
      { dish: 'Salad, Chutney', type: 'veg' },
    ],
    snacks: [
      { dish: 'Khasta Chaat', type: 'veg' },
      { dish: 'Pakori', type: 'veg' },
      { dish: 'Lemon Jeera', type: 'veg' },
    ],
    dinner: [
      { dish: 'Dum Aloo', type: 'veg' },
      { dish: 'Egg Curry', type: 'non-veg', highlight: true },
      { dish: 'Dal, Butter', type: 'veg' },
      { dish: 'Roti, Rice, Salad', type: 'veg' },
    ]
  },
  'Tuesday': {
    breakfast: [
      { dish: 'Khasta Kachori', type: 'veg' },
      { dish: 'Aloo Sabzi', type: 'veg' },
      { dish: 'Bread, Butter, Jam', type: 'veg' },
      { dish: 'Shakes/Tea, Veg Sandwich', type: 'veg' },
    ],
    lunch: [
      { dish: 'Kadhi', type: 'veg' },
      { dish: 'Arhar Dal, Jeera Aloo', type: 'veg' },
      { dish: 'Raita, Salad', type: 'veg' },
      { dish: 'Desi Ghee Roti, Chutney, Achaar', type: 'veg' },
    ],
    snacks: [
      { dish: 'Potli Samosa/Samosa', type: 'veg', highlight: true },
      { dish: 'Tea', type: 'veg' },
    ],
    dinner: [
      { dish: 'Mix Dal, Seasonal Veg', type: 'veg' },
      { dish: 'Butter Roti, Rice', type: 'veg' },
      { dish: 'Salad, Imarti Rabri', type: 'veg', highlight: true },
      { dish: 'Milk', type: 'veg' },
    ]
  },
  'Wednesday': {
    breakfast: [
      { dish: 'Bread Omelette', type: 'non-veg' },
      { dish: 'Veg Cutlet', type: 'veg' },
      { dish: 'Moong Dal Sprout Chat', type: 'veg' },
      { dish: 'Bread, Butter, Jam, Milk, Fruits', type: 'veg' },
    ],
    lunch: [
      { dish: 'Dal Makhni', type: 'veg', highlight: true },
      { dish: 'Seasonal Veg, Mixed Raita', type: 'veg' },
      { dish: 'Desi Ghee Roti', type: 'veg' },
      { dish: 'Macaroni Salad, Achaar', type: 'veg' },
    ],
    snacks: [
      { dish: 'Maggie', type: 'veg' },
      { dish: 'Cold Coffee', type: 'veg' },
    ],
    dinner: [
      { dish: 'Chiken Changezi', type: 'non-veg', highlight: true },
      { dish: 'Paneer Lababdar/Afghani Chaap', type: 'veg', highlight: true },
      { dish: 'Rumali Roti, Rice', type: 'veg' },
      { dish: 'Ice cream', type: 'veg', highlight: true },
    ]
  },
  'Thursday': {
    breakfast: [
      { dish: 'Idli/Vada', type: 'veg' },
      { dish: 'Sambhar, Chutney', type: 'veg' },
      { dish: 'Mix Paratha', type: 'veg' },
      { dish: 'Bread, Butter, Jam', type: 'veg' },
    ],
    lunch: [
      { dish: 'Chole', type: 'veg' },
      { dish: 'Kaddu, Poori', type: 'veg' },
      { dish: 'Boondi Raita, Salad', type: 'veg' },
      { dish: 'Chutney, Achaar', type: 'veg' },
    ],
    snacks: [
      { dish: 'Spring Roll/Kath Rolli', type: 'veg' },
      { dish: 'Cold Drinks', type: 'veg' },
    ],
    dinner: [
      { dish: 'Urad Chana Dal', type: 'veg' },
      { dish: 'Seasonal Veg', type: 'veg' },
      { dish: 'Rice, Butter Roti, Salad', type: 'veg' },
      { dish: 'Boondi Laddoo/Fruit Item', type: 'veg', highlight: true },
    ]
  },
  'Friday': {
    breakfast: [
      { dish: 'Stuffed Veg Chilla', type: 'veg' },
      { dish: 'Tomato Chutney', type: 'veg' },
      { dish: 'Bread, Butter, Jam', type: 'veg' },
      { dish: 'Kele Chane Chaat', type: 'veg' },
    ],
    lunch: [
      { dish: 'Rajma', type: 'veg', highlight: true },
      { dish: 'Baigan Bharta', type: 'veg' },
      { dish: 'Plain Rice, Desi Ghee Roti', type: 'veg' },
      { dish: 'Kachumbar Salad', type: 'veg' },
    ],
    snacks: [
      { dish: 'Bun Tikki/Burger', type: 'veg', highlight: true },
      { dish: 'Lahori Jeera', type: 'veg' },
    ],
    dinner: [
      { dish: 'Fried Rice/Noodles', type: 'veg' },
      { dish: 'Veg/Chicken Manchurian', type: 'non-veg', highlight: true },
      { dish: 'Chilli Paneer, Chicken', type: 'non-veg' },
      { dish: 'Cold Drink', type: 'veg' },
    ]
  },
  'Saturday': {
    breakfast: [
      { dish: 'Paneer Paratha', type: 'veg', highlight: true },
      { dish: 'Dahi', type: 'veg' },
      { dish: 'Bread, Butter, Jam', type: 'veg' },
      { dish: 'Tea/Milk, Sandwich', type: 'veg' },
    ],
    lunch: [
      { dish: 'Arhar Dal', type: 'veg' },
      { dish: 'Seasonal Veg, Rice', type: 'veg' },
      { dish: 'Desi Ghee Roti', type: 'veg' },
      { dish: 'Kheera Raita, Salad', type: 'veg' },
    ],
    snacks: [
      { dish: 'Pav Bhaji/Vada Pav', type: 'veg', highlight: true },
      { dish: 'Tea', type: 'veg' },
    ],
    dinner: [
      { dish: 'Dal Makhni', type: 'veg' },
      { dish: 'Seasonal Veg', type: 'veg' },
      { dish: 'Macaroni Salad, Rice, Roti', type: 'veg' },
      { dish: 'Moong Dal Halwa', type: 'veg', highlight: true },
    ]
  },
  'Sunday': {
    breakfast: [
      { dish: 'Boiled Egg', type: 'non-veg' },
      { dish: 'Veg Cutlet', type: 'veg' },
      { dish: 'Poha', type: 'veg' },
      { dish: 'Tea, Milk, Bread, Butter, Jam, Fruits', type: 'veg' },
    ],
    lunch: [
      { dish: 'Chole Bhature/Kulche', type: 'veg', highlight: true },
      { dish: 'Sweet Lassi', type: 'veg' },
      { dish: 'Sirka Pyaaz', type: 'veg' },
      { dish: 'Green Chutney, Rice', type: 'veg' },
    ],
    snacks: [
      { dish: 'Paneer/Chicken Noodles', type: 'non-veg' },
      { dish: 'Aloo Chaat', type: 'veg' },
      { dish: 'Cold Coffee', type: 'veg' },
    ],
    dinner: [
      { dish: 'Fish Curry/Chicken Curry', type: 'non-veg', highlight: true },
      { dish: 'Kadahi Paneer', type: 'veg', highlight: true },
      { dish: 'Rice, Roti, Salad', type: 'veg' },
      { dish: 'Jalebi', type: 'veg', highlight: true },
    ]
  }
};