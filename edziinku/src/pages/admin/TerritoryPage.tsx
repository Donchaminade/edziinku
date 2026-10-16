import { MapPinned, Pencil, Plus, ShieldAlert, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { PageHero } from '../../components/Hero';
import { AdminPage } from '../../components/layout/AdminLayout';
import { useDocumentTitle } from '../../components/layout/common';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/Decor';
import { Field, ScrollRow, Segmented, Select, Switch, TextInput } from '../../components/ui/Form';
import { Reveal, Skeleton, Stagger } from '../../components/ui/motion';
import { Modal, useToast } from '../../components/ui/Overlay';
import { photos } from '../../data/photos';
import { api, ApiError } from '../../lib/api';
import { contrastOn } from '../../lib/format';
import { useLive } from '../../lib/useCatalog';
import type { City, Neighborhood, UrgencyLevel } from '../../types';
import { Panel, SourceBadge } from './shared';

type Tab = 'quartiers' | 'villes' | 'urgences';

function UrgencyBadge({ label, color }: { label?: string | null; color?: string | null }) {
  if (!label) return null;
  const bg = color && /^#([0-9A-Fa-f]{6})$/.test(color) ? color : 'var(--primary)';
  return (
    <span className="urgency-badge" style={{ background: bg, color: contrastOn(color) }}>
      {label}
    </span>
  );
}

export function TerritoryPage() {
  useDocumentTitle('Territoire');
  const live = useLive();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('quartiers');
  const [cities, setCities] = useState<City[]>([]);
  const [hoods, setHoods] = useState<Neighborhood[]>([]);
  const [levels, setLevels] = useState<UrgencyLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [query, setQuery] = useState('');

  const [hoodModal, setHoodModal] = useState<Neighborhood | 'new' | null>(null);
  const [cityModal, setCityModal] = useState<City | 'new' | null>(null);
  const [levelModal, setLevelModal] = useState<UrgencyLevel | 'new' | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const [nextCities, nextHoods, nextLevels] = await Promise.all([
        api<City[]>('/api/admin/cities'),
        api<Neighborhood[]>('/api/admin/neighborhoods'),
        api<UrgencyLevel[]>('/api/admin/urgency-levels'),
      ]);
      setCities(nextCities);
      setHoods(nextHoods);
      setLevels(nextLevels);
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Impossible de charger le territoire', 'alert');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void reload(); }, []);

  const visibleHoods = useMemo(() => {
    const q = query.trim().toLowerCase();
    return hoods.filter((item) => {
      if (cityFilter && item.cityId !== cityFilter) return false;
      if (!q) return true;
      return `${item.name} ${item.commune} ${item.cityName ?? ''} ${item.aliases ?? ''}`.toLowerCase().includes(q);
    });
  }, [hoods, cityFilter, query]);

  return (
    <AdminPage>
      <PageHero
        photo={photos.apresPluie}
        size="sm"
        eyebrow={<span className="inline-flex items-center gap-2">Référentiel <SourceBadge source={live.source} /></span>}
        title="Territoire"
        short="Villes, quartiers et niveaux d’urgence."
        long="Complétez le découpage du Togo : villes, quartiers et niveaux d’urgence. Le seed n’est pas exhaustif — le reste se saisit ici."
      />

      <ScrollRow>
        <Segmented
          label="Rubrique du territoire"
          value={tab}
          onChange={setTab}
          className="min-w-max"
          options={[
            { value: 'quartiers', label: 'Quartiers', count: hoods.length },
            { value: 'villes', label: 'Villes', count: cities.length },
            { value: 'urgences', label: 'Niveaux', count: levels.length },
          ]}
        />
      </ScrollRow>

      {tab === 'quartiers' && (
        <Panel
          title="Quartiers"
          action={<Button size="sm" onClick={() => setHoodModal('new')}><Plus size={16} /> Ajouter</Button>}
        >
          <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_minmax(0,220px)]">
            <TextInput type="search" inputMode="search" placeholder="Nom, alias, commune…" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Rechercher un quartier" />
            <Select
              label="Filtrer par ville"
              value={cityFilter}
              onChange={setCityFilter}
              options={[{ value: '', label: 'Toutes les villes' }, ...cities.map((city) => ({ value: city.id, label: city.name, hint: city.region ?? undefined }))]}
            />
          </div>
          {loading ? <Skeleton className="h-48" /> : visibleHoods.length === 0 ? (
            <EmptyState icon={<MapPinned size={20} />} title="Aucun quartier" text="Aucun quartier ne correspond. Ajoutez-en depuis l’admin." />
          ) : (
            <Stagger className="grid gap-3">
              {visibleHoods.map((hood) => (
                <Reveal key={hood.id}>
                  <article className="card-solid flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{hood.name}</p>
                        <UrgencyBadge label={hood.urgencyLabel} color={hood.urgencyColor} />
                        {hood.active === false && <span className="badge">Inactif</span>}
                      </div>
                      <p className="mt-1 truncate text-sm text-muted">
                        {hood.cityName ?? hood.commune}
                        {hood.region ? ` · ${hood.region}` : ''}
                        {hood.aliases ? ` · alias ${hood.aliases}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setHoodModal(hood)}><Pencil size={15} /> Modifier</Button>
                      <Button size="sm" variant="danger" onClick={() => { void remove('/api/admin/neighborhoods', hood.id, hood.name, reload, toast); }}>
                        <Trash2 size={15} /> Supprimer
                      </Button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </Stagger>
          )}
        </Panel>
      )}

      {tab === 'villes' && (
        <Panel
          title="Villes"
          action={<Button size="sm" onClick={() => setCityModal('new')}><Plus size={16} /> Ajouter</Button>}
        >
          {loading ? <Skeleton className="h-48" /> : cities.length === 0 ? (
            <EmptyState icon={<MapPinned size={20} />} title="Aucune ville" text="Ajoutez Lomé, Kara ou une autre commune." />
          ) : (
            <Stagger className="grid gap-3">
              {cities.map((city) => (
                <Reveal key={city.id}>
                  <article className="card-solid flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-semibold">{city.name}</p>
                      <p className="mt-1 text-sm text-muted">
                        {[city.region, city.commune].filter(Boolean).join(' · ') || 'Région non renseignée'}
                        {' · '}{city.neighborhoodCount} quartier{city.neighborhoodCount > 1 ? 's' : ''}
                        {city.active ? '' : ' · inactive'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setCityModal(city)}><Pencil size={15} /> Modifier</Button>
                      <Button size="sm" variant="danger" onClick={() => { void remove('/api/admin/cities', city.id, city.name, reload, toast); }}>
                        <Trash2 size={15} /> Supprimer
                      </Button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </Stagger>
          )}
        </Panel>
      )}

      {tab === 'urgences' && (
        <Panel
          title="Niveaux d’urgence"
          action={<Button size="sm" onClick={() => setLevelModal('new')}><Plus size={16} /> Ajouter</Button>}
        >
          <p className="mb-4 text-sm text-muted">Plus le rang est petit, plus le quartier est urgent. Couleur unie uniquement.</p>
          {loading ? <Skeleton className="h-48" /> : levels.length === 0 ? (
            <EmptyState icon={<ShieldAlert size={20} />} title="Aucun niveau" text="Créez Critique, Élevé, Modéré, Calme." />
          ) : (
            <Stagger className="grid gap-3">
              {levels.map((level) => (
                <Reveal key={level.id}>
                  <article className="card-solid flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="urgency-swatch" style={{ background: level.color }} aria-hidden />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold">{level.label}</p>
                          <UrgencyBadge label={level.label} color={level.color} />
                          {level.active === false && <span className="badge">Inactif</span>}
                        </div>
                        <p className="mt-1 text-sm text-muted">Rang {level.rank} · {level.neighborhoodCount} quartier{level.neighborhoodCount > 1 ? 's' : ''} · {level.color}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setLevelModal(level)}><Pencil size={15} /> Modifier</Button>
                      <Button size="sm" variant="danger" onClick={() => { void remove('/api/admin/urgency-levels', level.id, level.label, reload, toast); }}>
                        <Trash2 size={15} /> Supprimer
                      </Button>
                    </div>
                  </article>
                </Reveal>
              ))}
            </Stagger>
          )}
        </Panel>
      )}

      {hoodModal && (
        <HoodForm
          initial={hoodModal === 'new' ? null : hoodModal}
          cities={cities}
          levels={levels}
          onClose={() => setHoodModal(null)}
          onSaved={() => { setHoodModal(null); void reload(); live.reload(); }}
        />
      )}
      {cityModal && (
        <CityForm
          initial={cityModal === 'new' ? null : cityModal}
          onClose={() => setCityModal(null)}
          onSaved={() => { setCityModal(null); void reload(); }}
        />
      )}
      {levelModal && (
        <LevelForm
          initial={levelModal === 'new' ? null : levelModal}
          onClose={() => setLevelModal(null)}
          onSaved={() => { setLevelModal(null); void reload(); }}
        />
      )}
    </AdminPage>
  );
}

async function remove(
  path: string,
  id: string,
  label: string,
  reload: () => Promise<void>,
  toast: (message: string, tone?: 'ok' | 'alert' | 'info') => void,
) {
  if (!window.confirm(`Supprimer « ${label} » ? S’il reste des signalements, l’API refusera et il faudra plutôt désactiver.`)) {
    return;
  }
  try {
    await api(`${path}/${id}`, { method: 'DELETE' });
    toast(`${label} supprimé`, 'ok');
    await reload();
  } catch (error) {
    toast(error instanceof ApiError ? error.message : 'Suppression impossible', 'alert');
  }
}

function HoodForm({
  initial,
  cities,
  levels,
  onClose,
  onSaved,
}: {
  initial: Neighborhood | null;
  cities: City[];
  levels: UrgencyLevel[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [cityId, setCityId] = useState(initial?.cityId ?? cities[0]?.id ?? '');
  const [urgencyId, setUrgencyId] = useState(initial?.urgencyId ?? levels[0]?.id ?? '');
  const [commune, setCommune] = useState(initial?.commune ?? '');
  const [aliases, setAliases] = useState(initial?.aliases ?? '');
  const [lat, setLat] = useState(initial?.latitude != null ? String(initial.latitude) : '');
  const [lng, setLng] = useState(initial?.longitude != null ? String(initial.longitude) : '');
  const [active, setActive] = useState(initial?.active !== false);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        cityId: cityId || null,
        urgencyLevelId: urgencyId || null,
        commune: commune || null,
        aliases: aliases || null,
        latitude: lat === '' ? null : Number(lat),
        longitude: lng === '' ? null : Number(lng),
        approximate: true,
        active,
      };
      if (initial) {
        await api(`/api/admin/neighborhoods/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Quartier mis à jour', 'ok');
      } else {
        await api('/api/admin/neighborhoods', { method: 'POST', body: JSON.stringify(payload) });
        toast('Quartier ajouté', 'ok');
      }
      onSaved();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Enregistrement impossible', 'alert');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Modifier le quartier' : 'Ajouter un quartier'} description="Ville, nom, niveau d’urgence et coordonnées optionnelles.">
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Nom" htmlFor="hood-name">
          <TextInput id="hood-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
        </Field>
        <Field label="Ville">
          <Select label="Ville" value={cityId} onChange={setCityId} options={cities.filter((city) => city.active).map((city) => ({ value: city.id, label: city.name, hint: city.region ?? undefined }))} />
        </Field>
        <Field label="Niveau d’urgence">
          <Select label="Niveau d’urgence" value={urgencyId} onChange={setUrgencyId} options={levels.filter((level) => level.active).map((level) => ({ value: level.id, label: level.label, hint: `Rang ${level.rank}` }))} />
        </Field>
        <Field label="Commune / arrondissement" htmlFor="hood-commune">
          <TextInput id="hood-commune" value={commune} onChange={(event) => setCommune(event.target.value)} maxLength={120} placeholder="Golfe 1, Kozah…" />
        </Field>
        <Field label="Alias" hint="Séparés par une virgule. Ex. Be, Bè Ahligo." htmlFor="hood-alias">
          <TextInput id="hood-alias" value={aliases} onChange={(event) => setAliases(event.target.value)} maxLength={400} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" htmlFor="hood-lat">
            <TextInput id="hood-lat" inputMode="decimal" value={lat} onChange={(event) => setLat(event.target.value)} placeholder="6.13" />
          </Field>
          <Field label="Longitude" htmlFor="hood-lng">
            <TextInput id="hood-lng" inputMode="decimal" value={lng} onChange={(event) => setLng(event.target.value)} placeholder="1.22" />
          </Field>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-sm font-semibold">Actif</span>
          <Switch on={active} onChange={setActive} label="Quartier actif" />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

function CityForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: City | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(initial?.name ?? '');
  const [region, setRegion] = useState(initial?.region ?? '');
  const [commune, setCommune] = useState(initial?.commune ?? '');
  const [lat, setLat] = useState(initial?.latitude != null ? String(initial.latitude) : '');
  const [lng, setLng] = useState(initial?.longitude != null ? String(initial.longitude) : '');
  const [active, setActive] = useState(initial?.active !== false);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name,
        region: region || null,
        commune: commune || null,
        latitude: lat === '' ? null : Number(lat),
        longitude: lng === '' ? null : Number(lng),
        active,
      };
      if (initial) {
        await api(`/api/admin/cities/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Ville mise à jour', 'ok');
      } else {
        await api('/api/admin/cities', { method: 'POST', body: JSON.stringify(payload) });
        toast('Ville ajoutée', 'ok');
      }
      onSaved();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Enregistrement impossible', 'alert');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Modifier la ville' : 'Ajouter une ville'} description="Nom, région ou préfecture, coordonnées optionnelles.">
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Nom" htmlFor="city-name">
          <TextInput id="city-name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
        </Field>
        <Field label="Région / préfecture" htmlFor="city-region">
          <TextInput id="city-region" value={region} onChange={(event) => setRegion(event.target.value)} maxLength={120} placeholder="Maritime, Kara…" />
        </Field>
        <Field label="Commune" htmlFor="city-commune">
          <TextInput id="city-commune" value={commune} onChange={(event) => setCommune(event.target.value)} maxLength={120} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" htmlFor="city-lat">
            <TextInput id="city-lat" inputMode="decimal" value={lat} onChange={(event) => setLat(event.target.value)} />
          </Field>
          <Field label="Longitude" htmlFor="city-lng">
            <TextInput id="city-lng" inputMode="decimal" value={lng} onChange={(event) => setLng(event.target.value)} />
          </Field>
        </div>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-sm font-semibold">Active</span>
          <Switch on={active} onChange={setActive} label="Ville active" />
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}

function LevelForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: UrgencyLevel | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [label, setLabel] = useState(initial?.label ?? '');
  const [color, setColor] = useState(initial?.color ?? '#D21034');
  const [rank, setRank] = useState(String(initial?.rank ?? 1));
  const [active, setActive] = useState(initial?.active !== false);
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = { label, color, rank: Number(rank), active };
      if (initial) {
        await api(`/api/admin/urgency-levels/${initial.id}`, { method: 'PUT', body: JSON.stringify(payload) });
        toast('Niveau mis à jour', 'ok');
      } else {
        await api('/api/admin/urgency-levels', { method: 'POST', body: JSON.stringify(payload) });
        toast('Niveau ajouté', 'ok');
      }
      onSaved();
    } catch (error) {
      toast(error instanceof ApiError ? error.message : 'Enregistrement impossible', 'alert');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open onClose={onClose} title={initial ? 'Modifier le niveau' : 'Ajouter un niveau'} description="Libellé, couleur unie et rang (1 = le plus urgent).">
      <form className="grid gap-4" onSubmit={submit}>
        <Field label="Libellé" htmlFor="level-label">
          <TextInput id="level-label" value={label} onChange={(event) => setLabel(event.target.value)} required maxLength={80} />
        </Field>
        <Field label="Couleur unie" hint="Aplat hexadécimal, sans dégradé." htmlFor="level-color">
          <span className="flex items-center gap-3">
            <input
              id="level-color"
              type="color"
              value={/^#([0-9A-Fa-f]{6})$/.test(color) ? color : '#D21034'}
              onChange={(event) => setColor(event.target.value.toUpperCase())}
              className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-line bg-transparent p-1"
              aria-label="Choisir une couleur unie"
            />
            <TextInput value={color} onChange={(event) => setColor(event.target.value.toUpperCase())} maxLength={7} className="flex-1" />
          </span>
        </Field>
        <Field label="Rang de gravité" hint="1 = le plus urgent." htmlFor="level-rank">
          <TextInput id="level-rank" inputMode="numeric" value={rank} onChange={(event) => setRank(event.target.value)} required />
        </Field>
        <div className="flex min-h-11 items-center justify-between gap-3">
          <span className="text-sm font-semibold">Actif</span>
          <Switch on={active} onChange={setActive} label="Niveau actif" />
        </div>
        <div className="flex items-center gap-3">
          <UrgencyBadge label={label || 'Aperçu'} color={color} />
          <span className="text-xs text-muted">Aperçu de l’aplat</span>
        </div>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="primary" loading={saving}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
