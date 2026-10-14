import { ArrowUpRight, Compass } from 'lucide-react';
import { Photo, PageHero } from '../../components/Hero';
import { useDocumentTitle } from '../../components/layout/common';
import { PublicPage } from '../../components/layout/PublicLayout';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Lift, Stagger, StaggerItem } from '../../components/ui/motion';
import { allPhotos, photos } from '../../data/photos';

export function CreditsPage() {
  useDocumentTitle('Crédits photos');
  return (
    <PublicPage>
      <PageHero
        photo={photos.grandMarche}
        eyebrow="Crédits"
        title="Crédits photos"
        short="Toutes les photos sont libres et créditées."
        long="Toutes les photos du site sont réelles, sous licence libre, et créditées à leurs auteurs. Les clichés de Lomé viennent de Wikimedia Commons."
        size="sm"
      />
      <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {allPhotos.map((photo) => (
          <StaggerItem key={photo.id}>
            <Lift className="card card-hover h-full overflow-hidden p-0">
              <div className="aspect-[16/10] overflow-hidden">
                <Photo photo={photo} className="h-full w-full object-cover" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
              </div>
              <div className="flex flex-col gap-1.5 p-4">
                <p className="text-sm font-semibold">{photo.alt}</p>
                <p className="text-xs text-muted">{photo.place}</p>
                <a href={photo.href} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-cyan">
                  {photo.author} · {photo.source} · {photo.license} <ArrowUpRight size={13} />
                </a>
              </div>
            </Lift>
          </StaggerItem>
        ))}
      </Stagger>
    </PublicPage>
  );
}

export function NotFoundPage() {
  useDocumentTitle('Page introuvable');
  return (
    <PublicPage>
      <PageHero photo={photos.adidogome} eyebrow="Erreur 404" title="Cette page a pris l’eau" short="L’adresse n’existe pas ou plus." size="sm" />
      <EmptyState
        title="Page introuvable"
        text="Revenez à l’accueil ou ouvrez la carte des signalements."
        icon={<Compass size={22} />}
        action={<div className="flex flex-wrap justify-center gap-2"><Button to="/" variant="primary">Accueil</Button><Button to="/carte">Carte live</Button></div>}
      />
    </PublicPage>
  );
}
