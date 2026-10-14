import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../model/app_model.dart';
import '../theme/edzii_theme.dart';
import '../widgets/motion.dart';

class Onboarding extends StatefulWidget {
  const Onboarding({super.key, required this.model});
  final AppModel model;

  @override
  State<Onboarding> createState() => _OnboardingState();
}

class _OnboardingState extends State<Onboarding> {
  int step = 0;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    final pages = [
      _Welcome(colors: colors),
      _Language(model: widget.model),
      _Hoods(model: widget.model),
      _Channels(model: widget.model),
    ];
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              Align(alignment: Alignment.centerRight, child: ThemeButton(model: widget.model)),
              Expanded(
                child: AnimatedSwitcher(
                  duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 320),
                  child: KeyedSubtree(key: ValueKey(step), child: pages[step]),
                ),
              ),
              Row(
                children: [
                  Text('${step + 1} / ${pages.length}', style: TextStyle(color: colors.muted)),
                  const Spacer(),
                  TapScale(
                    onTap: () {
                      if (step < pages.length - 1) {
                        setState(() => step += 1);
                      } else {
                        widget.model.finishOnboarding();
                      }
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(16),
                        color: colors.cyan,
                      ),
                      child: Text(step == pages.length - 1 ? 'Entrer' : 'Continuer', style: TextStyle(color: colors.ink, fontWeight: FontWeight.w700)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _Welcome extends StatelessWidget {
  const _Welcome({required this.colors});
  final EdziiColors colors;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Edzii-Nku', style: Theme.of(context).textTheme.headlineMedium),
        const SizedBox(height: 8),
        Text('L’œil de la pluie', style: TextStyle(color: colors.cyan, fontFamily: 'Sora', fontSize: 28, fontWeight: FontWeight.w600)),
        const SizedBox(height: 12),
        Text('Alertes d’inondation à Lomé, avant que l’eau n’entre dans la cour.', style: TextStyle(color: colors.muted, fontSize: 16, height: 1.4)),
      ],
    );
  }
}

class _Language extends StatelessWidget {
  const _Language({required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Langue des alertes', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 8),
        Text('L’éwé est un premier jet, à relire par un locuteur natif.', style: TextStyle(color: context.edzii.amber)),
        const SizedBox(height: 16),
        _Choice(label: 'Français', on: model.language == 'fr', onTap: () => model.setLanguage('fr')),
        _Choice(label: 'Eʋegbe', on: model.language == 'ewe', onTap: () => model.setLanguage('ewe')),
      ],
    );
  }
}

class _Hoods extends StatelessWidget {
  const _Hoods({required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    return ListView(
      children: [
        Text('Vos quartiers', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        for (final hood in model.hoods)
          RevealIn(
            index: model.hoods.indexOf(hood),
            child: _Choice(
              label: '${hood.name} · ${hood.commune}',
              on: model.selectedHoods.contains(hood.id),
              onTap: () => model.toggleHood(hood.id),
            ),
          ),
      ],
    );
  }
}

class _Channels extends StatelessWidget {
  const _Channels({required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Text('Comment vous prévenir', style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 12),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('Notifications'),
          value: model.push,
          onChanged: (value) => model.setChannel(pushEnabled: value),
        ),
        SwitchListTile(
          contentPadding: EdgeInsets.zero,
          title: const Text('WhatsApp'),
          value: model.whatsapp,
          onChanged: (value) => model.setChannel(whatsappEnabled: value),
        ),
      ],
    );
  }
}

class _Choice extends StatelessWidget {
  const _Choice({required this.label, required this.on, required this.onTap});
  final String label;
  final bool on;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: TapScale(
        onTap: onTap,
        child: AnimatedContainer(
          duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 220),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: on ? colors.cyanSoft : colors.card,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: on ? colors.cyan : colors.line),
          ),
          child: Text(label, style: TextStyle(color: colors.text, fontWeight: FontWeight.w600)),
        ),
      ),
    );
  }
}

class Shell extends StatefulWidget {
  const Shell({super.key, required this.model});
  final AppModel model;

  @override
  State<Shell> createState() => _ShellState();
}

class _ShellState extends State<Shell> {
  int index = 0;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    final pages = [
      AlertsScreen(model: widget.model),
      MapScreen(model: widget.model),
      ReportFlow(model: widget.model),
      ProfileScreen(model: widget.model),
    ];
    return Scaffold(
      body: AnimatedSwitcher(
        duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 280),
        child: KeyedSubtree(key: ValueKey(index), child: pages[index]),
      ),
      bottomNavigationBar: NavigationBar(
        backgroundColor: colors.bgElevated,
        indicatorColor: colors.cyanSoft,
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.notifications_outlined), label: 'Alertes'),
          NavigationDestination(icon: Icon(Icons.map_outlined), label: 'Carte'),
          NavigationDestination(icon: Icon(Icons.add_a_photo_outlined), label: 'Signaler'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
    );
  }
}

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key, required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Row(
            children: [
              Expanded(child: Text('Alertes', style: Theme.of(context).textTheme.headlineMedium)),
              ThemeButton(model: model),
            ],
          ),
          const SizedBox(height: 6),
          Text(model.fromApi ? 'En direct' : 'Données de démonstration', style: TextStyle(color: colors.muted)),
          const SizedBox(height: 16),
          for (var i = 0; i < model.alerts.length; i++)
            RevealIn(
              index: i,
              child: Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: TapScale(
                  onTap: () => Navigator.of(context).push(fadeRoute(AlertDetail(alert: model.alerts[i]))),
                  child: Hero(
                    tag: 'alert-${model.alerts[i].id}',
                    child: Material(
                      color: Colors.transparent,
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: colors.card,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: colors.line),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(model.alerts[i].neighborhood, style: TextStyle(color: colors.cyan, fontSize: 12, fontWeight: FontWeight.w700)),
                            const SizedBox(height: 6),
                            Text(model.alerts[i].title, style: Theme.of(context).textTheme.titleMedium),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class AlertDetail extends StatefulWidget {
  const AlertDetail({super.key, required this.alert});
  final AlertItem alert;

  @override
  State<AlertDetail> createState() => _AlertDetailState();
}

class _AlertDetailState extends State<AlertDetail> with SingleTickerProviderStateMixin {
  late final AnimationController _wave;

  @override
  void initState() {
    super.initState();
    _wave = AnimationController(vsync: this, duration: const Duration(milliseconds: 1600));
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (context.reduceMotion) {
      _wave.value = 1;
      _wave.stop();
    } else if (!_wave.isAnimating) {
      _wave.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _wave.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    final ewe = widget.alert.bodyEwe;
    return Scaffold(
      appBar: AppBar(backgroundColor: colors.bg, foregroundColor: colors.text, title: const Text('Alerte')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Hero(
            tag: 'alert-${widget.alert.id}',
            child: Material(
              color: Colors.transparent,
              child: Text(widget.alert.title, style: Theme.of(context).textTheme.headlineSmall),
            ),
          ),
          const SizedBox(height: 12),
          Text(widget.alert.body, style: TextStyle(color: colors.text, height: 1.45, fontSize: 16)),
          const SizedBox(height: 16),
          AnimatedBuilder(
            animation: _wave,
            builder: (context, _) {
              return Container(
                height: 10,
                decoration: BoxDecoration(color: colors.line, borderRadius: BorderRadius.circular(99)),
                alignment: Alignment.centerLeft,
                child: FractionallySizedBox(
                  widthFactor: 0.35 + _wave.value * 0.55,
                  child: Container(decoration: BoxDecoration(color: colors.cyan, borderRadius: BorderRadius.circular(99))),
                ),
              );
            },
          ),
          if (ewe != null) ...[
            const SizedBox(height: 20),
            Text(ewe, style: TextStyle(color: colors.text, height: 1.45)),
            const SizedBox(height: 8),
            Text('Texte en éwé à relire par un locuteur natif.', style: TextStyle(color: colors.amber)),
          ],
        ],
      ),
    );
  }
}

class MapScreen extends StatelessWidget {
  const MapScreen({super.key, required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    return FlutterMap(
      options: const MapOptions(initialCenter: LatLng(6.17, 1.23), initialZoom: 12),
      children: [
        TileLayer(
          urlTemplate: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          subdomains: const ['a', 'b', 'c', 'd'],
          userAgentPackageName: 'tg.edziinku.edziimobile',
        ),
        MarkerLayer(
          markers: [
            for (final report in model.reports)
              Marker(
                point: LatLng(report.lat, report.lng),
                width: 28,
                height: 28,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    color: report.level == 'TAILLE' ? colors.alert : report.level == 'GENOU' ? colors.amber : colors.cyan,
                    shape: BoxShape.circle,
                    border: Border.all(color: colors.mapText, width: 2),
                  ),
                ),
              ),
          ],
        ),
        const RichAttributionWidget(
          attributions: [
            TextSourceAttribution('OpenStreetMap'),
            TextSourceAttribution('CARTO'),
          ],
        ),
      ],
    );
  }
}

class ReportFlow extends StatefulWidget {
  const ReportFlow({super.key, required this.model});
  final AppModel model;

  @override
  State<ReportFlow> createState() => _ReportFlowState();
}

class _ReportFlowState extends State<ReportFlow> {
  int step = 0;
  bool photo = false;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    final steps = [
      _ReportStep(
        title: 'Photo',
        child: TapScale(
          onTap: () => setState(() => photo = !photo),
          child: AnimatedContainer(
            duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 250),
            height: 180,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: photo ? colors.cyanSoft : colors.card,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: colors.line),
            ),
            child: Text(photo ? 'Photo prête' : 'Toucher pour joindre une photo', style: TextStyle(color: colors.text)),
          ),
        ),
      ),
      _ReportStep(
        title: 'Position',
        child: Text('Le point sera celui du quartier choisi. La carte web utilise la même API.', style: TextStyle(color: colors.muted, height: 1.4)),
      ),
      _ReportStep(
        title: 'Niveau d’eau',
        child: Row(
          children: [
            for (final level in ['CHEVILLE', 'GENOU', 'TAILLE'])
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: TapScale(
                    onTap: () => widget.model.setLevel(level),
                    child: AnimatedContainer(
                        duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 220),
                        padding: const EdgeInsets.symmetric(vertical: 18),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: widget.model.waterLevel == level ? colors.cyanSoft : colors.card,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: widget.model.waterLevel == level ? colors.cyan : colors.line),
                        ),
                        child: Text(level == 'CHEVILLE' ? 'Cheville' : level == 'GENOU' ? 'Genou' : 'Taille', style: TextStyle(color: colors.text, fontWeight: FontWeight.w700)),
                      ),
                  ),
                ),
              ),
          ],
        ),
      ),
      _ReportStep(
        title: 'Confirmation',
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Eau : ${widget.model.waterLevel}', style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 8),
            Text(photo ? 'Photo jointe' : 'Sans photo', style: TextStyle(color: colors.muted)),
          ],
        ),
      ),
    ];
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Signaler', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 16),
            Expanded(
              child: AnimatedSwitcher(
                duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 280),
                child: KeyedSubtree(key: ValueKey(step), child: steps[step]),
              ),
            ),
            TapScale(
              onTap: () {
                if (step < steps.length - 1) {
                  setState(() => step += 1);
                } else {
                  setState(() => step = 0);
                  ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Signalement préparé. L’envoi passe par l’API web pour cette première version.')));
                }
              },
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  color: colors.cyan,
                ),
                child: Text(step == steps.length - 1 ? 'Terminer' : 'Suivant', style: TextStyle(color: colors.ink, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReportStep extends StatelessWidget {
  const _ReportStep({required this.title, required this.child});
  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: Theme.of(context).textTheme.titleLarge),
        const SizedBox(height: 16),
        child,
      ],
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    final colors = context.edzii;
    final night = model.theme == ThemeMode.dark;
    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text('Profil', style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 8),
          Text('Langue : ${model.language == 'ewe' ? 'Eʋegbe' : 'Français'}', style: TextStyle(color: colors.muted)),
          const SizedBox(height: 16),
          Text('Aperçu du thème', style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 8),
          AnimatedContainer(
            duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 400),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: night ? EdziiColors.night.bg : EdziiColors.day.bg,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: colors.line),
            ),
            child: Text(
              night ? 'Nuit' : 'Clair',
              style: TextStyle(color: night ? EdziiColors.night.text : EdziiColors.day.text, fontFamily: 'Sora'),
            ),
          ),
          const SizedBox(height: 12),
          ThemeButton(model: model),
          const SizedBox(height: 20),
          TextButton(
            onPressed: model.replayWelcome,
            child: const Text('Revoir l’accueil'),
          ),
        ],
      ),
    );
  }
}

class ThemeButton extends StatelessWidget {
  const ThemeButton({super.key, required this.model});
  final AppModel model;

  @override
  Widget build(BuildContext context) {
    final night = model.theme == ThemeMode.dark;
    return IconButton(
      tooltip: night ? 'Activer le thème clair' : 'Activer le thème nuit',
      onPressed: model.toggleTheme,
      icon: AnimatedSwitcher(
        duration: context.reduceMotion ? Duration.zero : const Duration(milliseconds: 280),
        transitionBuilder: (child, animation) => RotationTransition(turns: animation, child: child),
        child: Icon(night ? Icons.light_mode : Icons.dark_mode, key: ValueKey(night)),
      ),
    );
  }
}
