export const CATEGORIES = [
  { key: 'Friends', color: '#B3261E' },
  { key: 'Family', color: '#1F6F50' },
  { key: 'Books', color: '#8A5A2B' },
  { key: 'Hobbies', color: '#2A4B8D' },
  { key: 'My Opinions', color: '#C97A1E' },
  { key: 'Gatherings', color: '#4A4A4A' },
  { key: 'Journeys', color: '#8B5E83' },
  { key: 'Diary', color: '#6B4F3A', private: true },
  { key: 'My Writings', color: '#347D7A' },
];

export const categoryColor = (name) => {
  const found = CATEGORIES.find((c) => c.key === name);
  return found ? found.color : '#4A4A4A';
};
