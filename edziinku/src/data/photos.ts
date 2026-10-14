export type StockPhoto = {
  src: string;
  alt: string;
  author: string;
  source: 'Unsplash' | 'Pexels';
  href: string;
  place: string;
};

/** Photos réelles, libres de droits. Ce ne sont pas des clichés de Lomé : le lieu est indiqué. */
export const photos = {
  lekki: {
    src: '/photos/lekki.jpg',
    alt: 'Rue de marché inondée à Lekki, Lagos',
    author: 'Ben Iwara',
    source: 'Pexels',
    href: 'https://www.pexels.com/photo/flooded-market-street-scene-in-lekki-lagos-38459009/',
    place: 'Lekki, Lagos',
  },
  cap: {
    src: '/photos/cap.jpg',
    alt: 'Rue du Cap, Afrique du Sud',
    author: 'souley Binkas',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/UgkbNWbgDQ0',
    place: 'Le Cap',
  },
  kampala: {
    src: '/photos/kampala.jpg',
    alt: 'Rue commerçante à Kampala',
    author: 'Jonathan Ward',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/40I8Xjw91w0',
    place: 'Kampala',
  },
  nairobi: {
    src: '/photos/nairobi.jpg',
    alt: 'Passant sous la pluie à Nairobi',
    author: 'Grace Nandi',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/OqBxqAQItNc',
    place: 'Nairobi',
  },
  sao: {
    src: '/photos/sao.jpg',
    alt: 'Passants sur une chaussée mouillée à São Paulo',
    author: 'gustavo nacht',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/F2c2uTqV50I',
    place: 'São Paulo',
  },
  inondee: {
    src: '/photos/inondee.jpg',
    alt: 'Rue résidentielle inondée',
    author: 'yusrizal iskadi',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/W-snX25xw3s',
    place: 'Rue inondée',
  },
  entraide: {
    src: '/photos/entraide.jpg',
    alt: 'Bénévoles qui préparent des denrées ensemble',
    author: 'Joel Muniz',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/7uSrOyY1U0I',
    place: 'Entraide',
  },
  telephone: {
    src: '/photos/telephone.jpg',
    alt: 'Personne qui photographie la ville avec un téléphone',
    author: 'Artem Beliaikin',
    source: 'Unsplash',
    href: 'https://unsplash.com/photos/QnSNku8ez7s',
    place: 'Téléphone',
  },
} as const satisfies Record<string, StockPhoto>;
