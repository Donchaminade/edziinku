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
      <Stagger className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
        {allPhotos.map((photo) => (
          <StaggerItem key={photo.id}>
            <Lift className="card card-hover h-full overflow-hidden p-0">
              <div className="aspect-[16/10] overflow-hidden">
                <Photo photo={photo} className="h-full w-full object-cover" sizes="(min-width: 1024px) 33vw, 50vw" />
              </div>
              <div className="flex flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
                <p className="line-clamp-2 text-[13px] font-semibold leading-snug sm:text-sm">{photo.alt}</p>
                <p className="truncate text-xs text-muted">{photo.place}</p>
                <a href={photo.href} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-cyan sm:mt-1">
                  <span className="min-w-0 truncate">{photo.author} · {photo.source} · {photo.license}</span> <ArrowUpRight size={13} className="shrink-0" />
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
