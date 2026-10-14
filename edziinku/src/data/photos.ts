export type StockPhoto = {
  id: string;
  src: string;
  srcSm: string;
  alt: string;
  author: string;
  source: 'Wikimedia Commons' | 'Unsplash' | 'Pexels';
  license: string;
  href: string;
  place: string;
  /** Point focal de l’image (object-position), pour garder le sujet visible au recadrage. */
  focus?: string;
};

function photo(id: string, data: Omit<StockPhoto, 'id' | 'src' | 'srcSm'>): StockPhoto {
  return { id, src: `/photos/${id}.webp`, srcSm: `/photos/${id}-sm.webp`, ...data };
}

/**
 * Photos réelles sous licence libre. Les clichés « lome-* » sont pris à Lomé
 * (Wikimedia Commons) ; les autres viennent d’autres villes, et le lieu est indiqué.
 */
export const photos = {
  apresPluie: photo('lome-apres-pluie', {
    alt: 'Rue d’un quartier d’Agoè envahie par l’eau après la pluie',
    author: 'Kolanikp',
    source: 'Wikimedia Commons',
    license: 'CC0',
    href: 'https://commons.wikimedia.org/wiki/File:Quartier_apr%C3%A8s_la_pluie_01.jpg',
    place: 'Agoè, Lomé',
    focus: '50% 70%',
  }),
  bassin: photo('lome-bassin', {
    alt: 'Le bassin de Léo 2000 qui déborde sur la route',
    author: 'Podjololé',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Bassin_d%27eau_d%C3%A9bord%C3%A9.jpg',
    place: 'Léo 2000, Lomé',
    focus: '50% 60%',
  }),
  grandMarche: photo('lome-grand-marche', {
    alt: 'Le Grand Marché de Lomé et la cathédrale du Sacré-Cœur',
    author: 'Dan Sloan',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 2.0',
    href: 'https://commons.wikimedia.org/wiki/File:Lom%C3%A9_Grand_March%C3%A9_with_the_Cath%C3%A9drale_du_Sacr%C3%A9_Coeur_(33592985581).jpg',
    place: 'Grand Marché, Lomé',
    focus: '60% 40%',
  }),
  routePlage: photo('lome-route-plage', {
    alt: 'Boulevard du bord de mer à Lomé au coucher du soleil',
    author: 'Philip Nalangan',
    source: 'Wikimedia Commons',
    license: 'CC BY 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Lome_Togo_Beach_Road.jpg',
    place: 'Bord de mer, Lomé',
    focus: '55% 50%',
  }),
  hedzranawoe: photo('lome-hedzranawoe', {
    alt: 'Le marché de Hédzranawoé, à Lomé',
    author: 'Manamarthe',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:March%C3%A9_hedjranawoe_Lom%C3%A9_01.jpg',
    place: 'Hédzranawoé, Lomé',
    focus: '60% 55%',
  }),
  vue: photo('lome-vue', {
    alt: 'Vue de Lomé depuis Adidogomé',
    author: 'Hermannkass',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Photos_de_Lom%C3%A9_2.jpg',
    place: 'Adidogomé, Lomé',
  }),
  toits: photo('lome-toits', {
    alt: 'Toits de Lomé vus depuis Adidogomé',
    author: 'Hermannkass',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Photos_de_Lom%C3%A9_3.jpg',
    place: 'Adidogomé, Lomé',
  }),
  adidogome: photo('lome-adidogome', {
    alt: 'Rue d’Adidogomé au bord des rails, après la pluie',
    author: 'Hermannkass',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Rue_d%27adidigome_franciscain_au_bord_des_rails.jpg',
    place: 'Adidogomé, Lomé',
    focus: '50% 65%',
  }),
  adidogome2: photo('lome-adidogome-2', {
    alt: 'Flaques sur une rue d’Adidogomé après la pluie',
    author: 'Hermannkass',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Rue_d%27adidigome_franciscain_au_bord_des_rails_3.jpg',
    place: 'Adidogomé, Lomé',
    focus: '50% 65%',
  }),
  togbagan: photo('lome-togbagan', {
    alt: 'Zone inondée à Togbagan',
    author: 'Podjololé',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Togbagan.jpg',
    place: 'Togbagan, Grand Lomé',
    focus: '50% 70%',
  }),
  plage: photo('lome-plage', {
    alt: 'Plage de Lomé au coucher du soleil',
    author: 'Philip Nalangan',
    source: 'Wikimedia Commons',
    license: 'CC BY 4.0',
    href: 'https://commons.wikimedia.org/wiki/File:Lome_Beach_Togo_1.jpg',
    place: 'Plage, Lomé',
  }),
  rue: photo('lome-rue', {
    alt: 'Rue commerçante de Lomé',
    author: 'Milos58',
    source: 'Wikimedia Commons',
    license: 'CC BY-SA 3.0',
    href: 'https://commons.wikimedia.org/wiki/File:Street_Lome_Togo_-_panoramio_-_Milos58_(1).jpg',
    place: 'Lomé',
  }),
  lekki: photo('lekki', {
    alt: 'Rue de marché inondée à Lekki, Lagos',
    author: 'Ben Iwara',
    source: 'Pexels',
    license: 'Licence Pexels',
    href: 'https://www.pexels.com/photo/flooded-market-street-scene-in-lekki-lagos-38459009/',
    place: 'Lekki, Lagos',
  }),
  cap: photo('cap', {
    alt: 'Rue du Cap, Afrique du Sud',
    author: 'souley Binkas',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/UgkbNWbgDQ0',
    place: 'Le Cap',
  }),
  kampala: photo('kampala', {
    alt: 'Rue commerçante à Kampala',
    author: 'Jonathan Ward',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/40I8Xjw91w0',
    place: 'Kampala',
  }),
  nairobi: photo('nairobi', {
    alt: 'Passant sous la pluie à Nairobi',
    author: 'Grace Nandi',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/OqBxqAQItNc',
    place: 'Nairobi',
  }),
  sao: photo('sao', {
    alt: 'Passants sur une chaussée mouillée à São Paulo',
    author: 'gustavo nacht',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/F2c2uTqV50I',
    place: 'São Paulo',
  }),
  inondee: photo('inondee', {
    alt: 'Rue résidentielle inondée',
    author: 'yusrizal iskadi',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/W-snX25xw3s',
    place: 'Rue inondée',
  }),
  entraide: photo('entraide', {
    alt: 'Bénévoles qui préparent des denrées ensemble',
    author: 'Joel Muniz',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/7uSrOyY1U0I',
    place: 'Entraide',
  }),
  telephone: photo('telephone', {
    alt: 'Personne qui photographie la ville avec un téléphone',
    author: 'Artem Beliaikin',
    source: 'Unsplash',
    license: 'Licence Unsplash',
    href: 'https://unsplash.com/photos/QnSNku8ez7s',
    place: 'Téléphone',
  }),
} as const satisfies Record<string, StockPhoto>;

export const allPhotos: StockPhoto[] = Object.values(photos);
