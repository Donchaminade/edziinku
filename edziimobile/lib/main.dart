import 'package:flutter/material.dart';

import 'model/app_model.dart';
import 'screens/screens.dart';
import 'theme/edzii_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const EdziiApp());
}

class EdziiApp extends StatefulWidget {
  const EdziiApp({super.key});

  @override
  State<EdziiApp> createState() => _EdziiAppState();
}

class _EdziiAppState extends State<EdziiApp> {
  final AppModel model = AppModel();

  @override
  void initState() {
    super.initState();
    model.load();
  }

  @override
  void dispose() {
    model.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final reduce = WidgetsBinding.instance.platformDispatcher.accessibilityFeatures.disableAnimations;
    return ListenableBuilder(
      listenable: model,
      builder: (context, _) {
        return MaterialApp(
          title: 'Edzii-Nku',
          debugShowCheckedModeBanner: false,
          theme: edziiTheme(false),
          darkTheme: edziiTheme(true),
          themeMode: model.theme,
          themeAnimationDuration: reduce ? Duration.zero : const Duration(milliseconds: 450),
          home: !model.ready
              ? const Scaffold(body: Center(child: Text('Edzii-Nku')))
              : model.onboarded
                  ? Shell(model: model)
                  : Onboarding(model: model),
        );
      },
    );
  }
}
