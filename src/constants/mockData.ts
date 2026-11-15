export const categories = ['All', 'Women', 'Men', 'Sportswear', 'Designer'];

export const browseCategories = [
  'Tops',
  'Bottoms',
  'Outerwear',
  'Dresses',
  'Footwear',
  'Accessories',
  'Bags',
];

export const items = [
  {
    id: '1',
    title: 'Denim jacket',
    condition: 'Good',
    size: 'M',
    category: 'Women',
    subcategory: 'Outerwear',
    status: 'Active',
    uploaded: '3 hours ago',
    description:
      'Lightly worn jacket. Plenty of wear left! Doesn’t fit me anymore so want to donate.',
    pickup: 'Tierney Building, 9am on Mondays',
  },
  {
    id: '2',
    title: 'Rugby jersey',
    condition: 'Like new',
    size: 'L',
    category: 'Sportswear',
    subcategory: 'Tops',
    status: 'Active',
    uploaded: '1 day ago',
    description: 'Worn once. Washed and ready to go.',
    pickup: 'Students’ Union, 1pm on Wednesdays',
  },
  {
    id: '3',
    title: 'Wool coat',
    condition: 'Fair',
    size: 'S',
    category: 'Men',
    subcategory: 'Outerwear',
    status: 'Liked',
    uploaded: '2 days ago',
    description: 'Warm winter coat with a small mark on one sleeve.',
    pickup: 'Library entrance, 5pm on Fridays',
  },
  {
    id: '4',
    title: 'Silk scarf',
    condition: 'New',
    size: 'One size',
    category: 'Designer',
    subcategory: 'Accessories',
    status: 'Completed',
    uploaded: '5 days ago',
    description: 'Never worn, still has tags.',
    pickup: 'Arts Building, 11am on Tuesdays',
  },
  {
    id: '5',
    title: 'Running shorts',
    condition: 'Good',
    size: 'M',
    category: 'Sportswear',
    subcategory: 'Bottoms',
    status: 'Active',
    uploaded: '1 week ago',
    description: 'Lightweight shorts, good for training.',
    pickup: 'Sports Centre, 6pm on Thursdays',
  },
  {
    id: '6',
    title: 'Linen shirt',
    condition: 'Like new',
    size: 'L',
    category: 'Men',
    subcategory: 'Tops',
    status: 'Active',
    uploaded: '1 week ago',
    description: 'Breathable shirt, perfect for summer.',
    pickup: 'Science Building, 10am on Mondays',
  },
];

export const transactions = [
  {
    id: 't1',
    recipient: 'randomuser99',
    itemName: 'Silk scarf',
    date: '26/11/2026',
    feedback: false,
  },
  {
    id: 't2',
    recipient: 'randomuser99',
    itemName: 'Linen shirt',
    date: '24/11/2026',
    feedback: true,
  },
];

export const scheduled = [
  {
    id: 's1',
    user: 'randomuser99',
    itemName: 'Denim jacket',
    location: 'TSI Building',
    time: '10:15am 12/11/2026',
  },
  {
    id: 's2',
    user: 'randomuser99',
    itemName: 'Wool coat',
    location: 'TSI Building',
    time: '10:15am 12/11/2026',
  },
];

export const user = {
  username: 'username123',
  points: 10000,
  itemsDonated: 7,
  reviewAverage: 4.8,
  reviewCount: 7,
  co2Saved: 36,
};

export const reviews = [
  {
    id: 'r1',
    user: 'randomuser99',
    rating: 5,
    time: '4 days ago',
    comment: 'Item as described and great communication from donor!',
  },
  {
    id: 'r2',
    user: 'anotheruser03',
    rating: 5,
    time: '2 weeks ago',
    comment: 'Item as described and great communication from donor!',
  },
  {
    id: 'r3',
    user: 'imsosustainable',
    rating: 4,
    time: '5 weeks ago',
    comment: 'Item as described and great communication from donor!',
  },
  {
    id: 'r4',
    user: 'reducereuserecycler',
    rating: 5,
    time: '8 weeks ago',
    comment: 'Item as described and great communication from donor!',
  },
  {
    id: 'r5',
    user: 'maynoothstudent26',
    rating: 5,
    time: '10 weeks ago',
    comment: 'Item as described and great communication from donor!',
  },
];

export const notifications = [
  { id: 'n1', type: 'request', user: 'randomuser99', time: '17 minutes ago' },
  { id: 'n2', type: 'like', user: 'randomuser99', time: '18 minutes ago' },
  { id: 'n3', type: 'like', user: 'anotheruser03', time: '52 minutes ago' },
  { id: 'n4', type: 'like', user: 'imsosustainable', time: '2 hours ago' },
  { id: 'n5', type: 'like', user: 'imsosustainable', time: '2 hours ago' },
  { id: 'n6', type: 'request', user: 'reducereuserecycler', time: '1 day ago' },
  { id: 'n7', type: 'like', user: 'maynoothstudent26', time: '1 day ago' },
  { id: 'n8', type: 'like', user: 'maynoothstudent26', time: '1 day ago' },
  { id: 'n9', type: 'like', user: 'maynoothstudent26', time: '1 day ago' },
];
