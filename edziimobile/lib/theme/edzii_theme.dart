import 'package:flutter/material.dart';

/// Jetons de la charte. Les écrans lisent ces couleurs via [EdziiColors],
/// jamais une valeur en dur.
@immutable
class EdziiColors extends ThemeExtension<EdziiColors> {
  const EdziiColors({
    required this.bg,
    required this.bgElevated,
    required this.card,
    required this.line,
    required this.text,
    required this.muted,
    required this.cyan,
    required this.water,
    required this.ink,
    required this.alert,
    required this.amber,
    required this.ok,
    required this.cyanSoft,
    required this.alertSoft,
    required this.amberSoft,
    required this.mapBg,
    required this.mapText,
  });

  final Color bg;
  final Color bgElevated;
  final Color card;
  final Color line;
  final Color text;
  final Color muted;
  final Color cyan;
  final Color water;
  final Color ink;
  final Color alert;
  final Color amber;
  final Color ok;
  final Color cyanSoft;
  final Color alertSoft;
  final Color amberSoft;
  final Color mapBg;
  final Color mapText;

  static const night = EdziiColors(
    bg: Color(0xFF030B1E),
    bgElevated: Color(0xFF071733),
    card: Color(0x0CFFFFFF),
    line: Color(0x297FD8FF),
    text: Color(0xFFEAF6FF),
    muted: Color(0xFF8FA6C8),
    cyan: Color(0xFF5CE1F2),
    water: Color(0xFF2F86E8),
    ink: Color(0xFF03132F),
    alert: Color(0xFFFF8FA3),
    amber: Color(0xFFE9A93A),
    ok: Color(0xFF34D399),
    cyanSoft: Color(0x295CE1F2),
    alertSoft: Color(0x26FF5C7A),
    amberSoft: Color(0x2BF5B84B),
    mapBg: Color(0xFF07111F),
    mapText: Color(0xFFEAF6FF),
  );

  static const day = EdziiColors(
    bg: Color(0xFFF3F7FC),
    bgElevated: Color(0xFFFFFFFF),
    card: Color(0xFFFFFFFF),
    line: Color(0xFFDCE6F2),
    text: Color(0xFF071733),
    muted: Color(0xFF5B6F8F),
    cyan: Color(0xFF0E9DB8),
    water: Color(0xFF2F86E8),
    ink: Color(0xFF03132F),
    alert: Color(0xFFE0435F),
    amber: Color(0xFFB97A12),
    ok: Color(0xFF0F9F6E),
    cyanSoft: Color(0x1F0E9DB8),
    alertSoft: Color(0x1FE0435F),
    amberSoft: Color(0x24B97A12),
    mapBg: Color(0xFF07111F),
    mapText: Color(0xFFEAF6FF),
  );

  @override
  EdziiColors copyWith({
    Color? bg,
    Color? bgElevated,
    Color? card,
    Color? line,
    Color? text,
    Color? muted,
    Color? cyan,
    Color? water,
    Color? ink,
    Color? alert,
    Color? amber,
    Color? ok,
    Color? cyanSoft,
    Color? alertSoft,
    Color? amberSoft,
    Color? mapBg,
    Color? mapText,
  }) {
    return EdziiColors(
      bg: bg ?? this.bg,
      bgElevated: bgElevated ?? this.bgElevated,
      card: card ?? this.card,
      line: line ?? this.line,
      text: text ?? this.text,
      muted: muted ?? this.muted,
      cyan: cyan ?? this.cyan,
      water: water ?? this.water,
      ink: ink ?? this.ink,
      alert: alert ?? this.alert,
      amber: amber ?? this.amber,
      ok: ok ?? this.ok,
      cyanSoft: cyanSoft ?? this.cyanSoft,
      alertSoft: alertSoft ?? this.alertSoft,
      amberSoft: amberSoft ?? this.amberSoft,
      mapBg: mapBg ?? this.mapBg,
      mapText: mapText ?? this.mapText,
    );
  }

  @override
  EdziiColors lerp(ThemeExtension<EdziiColors>? other, double t) {
    if (other is! EdziiColors) return this;
    Color mix(Color a, Color b) => Color.lerp(a, b, t)!;
    return EdziiColors(
      bg: mix(bg, other.bg),
      bgElevated: mix(bgElevated, other.bgElevated),
      card: mix(card, other.card),
      line: mix(line, other.line),
      text: mix(text, other.text),
      muted: mix(muted, other.muted),
      cyan: mix(cyan, other.cyan),
      water: mix(water, other.water),
      ink: mix(ink, other.ink),
      alert: mix(alert, other.alert),
      amber: mix(amber, other.amber),
      ok: mix(ok, other.ok),
      cyanSoft: mix(cyanSoft, other.cyanSoft),
      alertSoft: mix(alertSoft, other.alertSoft),
      amberSoft: mix(amberSoft, other.amberSoft),
      mapBg: mix(mapBg, other.mapBg),
      mapText: mix(mapText, other.mapText),
    );
  }
}

extension EdziiContext on BuildContext {
  EdziiColors get edzii => Theme.of(this).extension<EdziiColors>()!;
  bool get reduceMotion => MediaQuery.disableAnimationsOf(this);
}

ThemeData edziiTheme(bool night) {
  final colors = night ? EdziiColors.night : EdziiColors.day;
  final scheme = ColorScheme(
    brightness: night ? Brightness.dark : Brightness.light,
    primary: colors.cyan,
    onPrimary: colors.ink,
    secondary: colors.water,
    onSecondary: colors.ink,
    error: colors.alert,
    onError: colors.ink,
    surface: colors.bgElevated,
    onSurface: colors.text,
  );
  return ThemeData(
    useMaterial3: true,
    brightness: scheme.brightness,
    colorScheme: scheme,
    scaffoldBackgroundColor: colors.bg,
    fontFamily: 'Work Sans',
    textTheme: const TextTheme(
      headlineMedium: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w600, letterSpacing: -0.6),
      headlineSmall: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w600, letterSpacing: -0.4),
      titleLarge: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w600),
      titleMedium: TextStyle(fontFamily: 'Sora', fontWeight: FontWeight.w600),
    ),
    extensions: [colors],
    splashFactory: InkSparkle.splashFactory,
  );
}
