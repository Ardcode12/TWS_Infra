export const roomCategories = ['Hall', 'Kitchen', 'Balcony', 'Garden'] as const;
export type RoomCategory = typeof roomCategories[number];
export type Design = {id: string; name: string; category: RoomCategory; image: string; description: string};
export const designs: Design[] = [
  {id:'hall-1',name:'Warm & collected',category:'Hall',image:'/images/villa.jpg',description:'Layered seating, natural textures and a gallery wall create a welcoming place to gather.'},
  {id:'hall-2',name:'Quiet modern',category:'Hall',image:'/images/interior.jpg',description:'A light palette and uncluttered furniture bring a calm, contemporary direction to your living space.'},
  {id:'hall-3',name:'Open living',category:'Hall',image:'/images/hero.jpg',description:'Connected living and dining areas with timber accents and a strong architectural staircase.'},
  {id:'kitchen-1',name:'The breakfast counter',category:'Kitchen',image:'/images/designs/kitchen-1.jpg',description:'White cabinetry, a generous worktop and timber bar seating for everyday conversations.'},
  {id:'kitchen-2',name:'Clean & practical',category:'Kitchen',image:'/images/designs/kitchen-2.jpg',description:'Simple cabinet fronts and an understated palette keep the kitchen bright and easy to organise.'},
  {id:'kitchen-3',name:'Gather around',category:'Kitchen',image:'/images/designs/kitchen-3.jpg',description:'An island with casual seating makes room for preparing meals and spending time together.'},
  {id:'balcony-1',name:'Classic terrace',category:'Balcony',image:'/images/designs/balcony-1.jpg',description:'Decorative outdoor seating and leafy surroundings inspire an elegant balcony retreat.'},
  {id:'balcony-2',name:'A green corner',category:'Balcony',image:'/images/designs/balcony-2.jpg',description:'Potted plants and a comfortable chair turn an outdoor corner into a place to pause.'},
  {id:'balcony-3',name:'A moment outside',category:'Balcony',image:'/images/designs/balcony-3.jpg',description:'A compact chair-and-table arrangement makes space for a morning coffee outdoors.'},
  {id:'garden-1',name:'Architectural greens',category:'Garden',image:'/images/house.jpg',description:'Stepping stones and a simple lawn connect contemporary architecture with the outdoors.'},
  {id:'garden-2',name:'Room to grow',category:'Garden',image:'/images/designs/garden-2.jpg',description:'An open lawn creates a flexible outdoor area for relaxing, playing and gathering.'},
  {id:'garden-3',name:'The flowering walk',category:'Garden',image:'/images/designs/garden-3.jpg',description:'Layered planting and a flower-lined path bring colour and a sense of discovery to the garden.'},
];
