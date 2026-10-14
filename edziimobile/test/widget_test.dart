import 'package:edziimobile/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('l’accueil s’ouvre en thème nuit et le bouton de thème répond', (tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const EdziiApp());
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 50));
    expect(find.text('Edzii-Nku'), findsOneWidget);

    final material = tester.widget<MaterialApp>(find.byType(MaterialApp));
    expect(material.themeMode, ThemeMode.dark);

    await tester.tap(find.byTooltip('Activer le thème clair'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 400));

    final updated = tester.widget<MaterialApp>(find.byType(MaterialApp));
    expect(updated.themeMode, ThemeMode.light);
  });
}
