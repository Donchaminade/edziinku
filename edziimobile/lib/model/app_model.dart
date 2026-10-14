import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class Hood {
  const Hood(this.id, this.name, this.commune, this.risk);
  final String id;
  final String name;
  final String commune;
  final String risk;
}

class AlertItem {
  const AlertItem({
    required this.id,
    required this.title,
    required this.body,
    required this.bodyEwe,
    required this.level,
    required this.neighborhood,
  });

  final String id;
  final String title;
  final String body;
  final String? bodyEwe;
  final String level;
  final String neighborhood;
}

class LiveReport {
  const LiveReport(this.id, this.place, this.level, this.lat, this.lng);
  final String id;
  final String place;
  final String level;
  final double lat;
  final double lng;
}

const demoHoods = [
  Hood('be', 'Bè', 'Golfe 1', 'Risque élevé'),
  Hood('agoe', 'Agoè-Nyivé', 'Agoè-Nyivé 1', 'Risque élevé'),
  Hood('zogbedji', 'Zogbédji', 'Agoè-Nyivé', 'À surveiller'),
  Hood('adakpame', 'Adakpamé', 'Golfe 4', 'À surveiller'),
  Hood('hedzranawoe', 'Hédzranawoé', 'Golfe 2', 'À surveiller'),
  Hood('tokoin', 'Tokoin', 'Golfe 3', 'Risque modéré'),
];

const demoAlerts = [
  AlertItem(
    id: 'alerte-be',
    title: 'Forte pluie prévue à Bè',
    body: 'De fortes pluies sont prévues ce soir de 18 h à 23 h (45 à 60 mm). Surélevez vos biens, évitez les caniveaux.',
    bodyEwe: 'Tsi gã adza fiẽ sia tso gaƒoƒo 18 vaseɖe 23 (45–60 mm). Tsiɖɔɖɔ ƒe afɔku le wò kɔƒe me.',
    level: 'ELEVE',
    neighborhood: 'Bè',
  ),
  AlertItem(
    id: 'alerte-genou',
    title: 'Eau signalée au genou',
    body: 'Bè Ahligo · 3 signalements concordants.',
    bodyEwe: null,
    level: 'VIGILANCE',
    neighborhood: 'Bè',
  ),
];

const demoReports = [
  LiveReport('EN-0318', 'Bè Ahligo, près du marché', 'GENOU', 6.1328, 1.2342),
  LiveReport('EN-0320', 'Agoè Kitidjan, rue pavée', 'TAILLE', 6.226, 1.181),
  LiveReport('EN-0325', 'Bassin Léo 2000', 'GENOU', 6.16, 1.27),
];

class AppModel extends ChangeNotifier {
  bool ready = false;
  bool onboarded = false;
  ThemeMode theme = ThemeMode.dark;
  String language = 'fr';
  final Set<String> selectedHoods = {};
  bool push = true;
  bool whatsapp = true;
  String waterLevel = 'GENOU';
  List<Hood> hoods = demoHoods;
  List<AlertItem> alerts = demoAlerts;
  List<LiveReport> reports = demoReports;
  bool fromApi = false;

  static const apiBase = String.fromEnvironment('API_BASE', defaultValue: 'http://localhost:8080');

  Future<void> load() async {
    final prefs = await SharedPreferences.getInstance();
    final stored = prefs.getString('edzii-theme');
    theme = stored == 'light' ? ThemeMode.light : ThemeMode.dark;
    onboarded = prefs.getBool('edzii-onboarded') ?? false;
    language = prefs.getString('edzii-lang') ?? 'fr';
    ready = true;
    notifyListeners();
    await refresh();
  }

  Future<void> toggleTheme() async {
    theme = theme == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('edzii-theme', theme == ThemeMode.light ? 'light' : 'dark');
  }

  Future<void> replayWelcome() async {
    onboarded = false;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('edzii-onboarded', false);
  }

  Future<void> finishOnboarding() async {
    onboarded = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('edzii-onboarded', true);
    await prefs.setString('edzii-lang', language);
  }

  void setLanguage(String value) {
    language = value;
    notifyListeners();
  }

  void toggleHood(String id) {
    if (!selectedHoods.add(id)) selectedHoods.remove(id);
    notifyListeners();
  }

  void setChannel({bool? pushEnabled, bool? whatsappEnabled}) {
    if (pushEnabled != null) push = pushEnabled;
    if (whatsappEnabled != null) whatsapp = whatsappEnabled;
    notifyListeners();
  }

  void setLevel(String level) {
    waterLevel = level;
    notifyListeners();
  }

  Future<void> refresh() async {
    try {
      final alertsResponse = await http.get(Uri.parse('$apiBase/api/alerts')).timeout(const Duration(seconds: 4));
      final hoodsResponse = await http.get(Uri.parse('$apiBase/api/neighborhoods')).timeout(const Duration(seconds: 4));
      final reportsResponse = await http.get(Uri.parse('$apiBase/api/reports?size=20')).timeout(const Duration(seconds: 4));
      if (alertsResponse.statusCode != 200) return;
      final decodedAlerts = jsonDecode(alertsResponse.body) as List<dynamic>;
      alerts = decodedAlerts.map((raw) {
        final item = raw as Map<String, dynamic>;
        return AlertItem(
          id: '${item['id']}',
          title: '${item['title']}',
          body: '${item['body']}',
          bodyEwe: item['bodyEwe'] as String?,
          level: '${item['level']}',
          neighborhood: '${item['neighborhoodName'] ?? 'Lomé'}',
        );
      }).toList();
      if (hoodsResponse.statusCode == 200) {
        final decoded = jsonDecode(hoodsResponse.body) as List<dynamic>;
        hoods = decoded.map((raw) {
          final item = raw as Map<String, dynamic>;
          return Hood('${item['id']}', '${item['name']}', '${item['commune']}', '${item['riskLabel']}');
        }).toList();
      }
      if (reportsResponse.statusCode == 200) {
        final page = jsonDecode(reportsResponse.body) as Map<String, dynamic>;
        final items = page['items'] as List<dynamic>? ?? [];
        reports = items.map((raw) {
          final item = raw as Map<String, dynamic>;
          return LiveReport(
            '${item['reference']}',
            '${item['placeLabel']}',
            '${item['waterLevel']}',
            (item['latitude'] as num).toDouble(),
            (item['longitude'] as num).toDouble(),
          );
        }).toList();
      }
      fromApi = true;
      notifyListeners();
    } catch (_) {
      fromApi = false;
    }
  }
}
