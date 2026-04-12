---
name: react-native
description: Skill pour développer les écrans React Native (Expo) de Konprann. Couvre le monorepo, NativeWind, Expo Router, la gestion audio/vidéo/caméra et le mode hors-ligne pour le contexte haïtien.
---

# React Native Expo — Konprann Skill

## Structure d'un Écran Expo Router

```typescript
// packages/mobile/app/(excellence)/quiz/[id].tsx
import { useLocalSearchParams } from 'expo-router';
import { useQuiz } from '@konprann/shared/api/quiz';
import { QuizScreen } from '@konprann/ui/native/quiz';

export default function QuizPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isLoading } = useQuiz(id);

  if (isLoading) return <KonprannLoader />;
  return <QuizScreen quiz={data} />;
}
```

## Audio — Manman Marie (Volet Fondation)

```typescript
// packages/shared/hooks/useManmanMarie.ts
import { Audio } from 'expo-av';

export function useManmanMarie() {
  const playPhrase = async (phraseKey: string) => {
    // 1. Vérifier le cache local d'abord
    const cached = await getCachedAudio(phraseKey);
    const uri = cached ?? await fetchAudio(phraseKey);

    const { sound } = await Audio.Sound.createAsync({ uri });
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) sound.unloadAsync();
    });
  };

  return { playPhrase };
}
```

## Enregistrement Vocal (STT)

```typescript
// packages/shared/hooks/useVoiceRecorder.ts
import { Audio } from 'expo-av';

export function useVoiceRecorder() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const startRecording = async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true });
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    setRecording(recording);
  };

  const stopAndTranscribe = async (): Promise<string> => {
    await recording?.stopAndUnloadAsync();
    const uri = recording?.getURI();
    // Envoi au backend Whisper
    const transcription = await api.post('/api/v1/stt/transcribe', { audio_uri: uri });
    return transcription.text;
  };

  return { startRecording, stopAndTranscribe, isRecording: !!recording };
}
```

## Caméra Lectrice

```typescript
// packages/mobile/components/CameraReader.native.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';

export function CameraReader({ onTextDetected }: { onTextDetected: (text: string, explanation: string) => void }) {
  const [permission, requestPermission] = useCameraPermissions();

  const captureAndRead = async () => {
    const photo = await cameraRef.current?.takePictureAsync({ base64: true });
    const result = await api.post('/api/v1/fondation/camera-read', {
      image_base64: photo?.base64,
      user_level: userLevel,
    });
    onTextDetected(result.text, result.explanation_creole);
    // Lire l'explication avec Manman Marie
    await playManmanMarie(result.audio_explanation_url);
  };

  return (
    <CameraView ref={cameraRef} style={{ flex: 1 }}>
      <TouchableOpacity
        style={styles.captureButton} // min 64x64px
        onPress={captureAndRead}
        accessibilityLabel="Pran foto pou li tèks la"
      />
    </CameraView>
  );
}
```

## Mode Hors-Ligne

```typescript
// packages/shared/offline/lessonCache.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('konprann_offline.db');

export async function downloadLesson(lessonId: string) {
  const lesson = await api.get(`/api/v1/fondation/lessons/${lessonId}`);
  // Stocker le contenu textuel
  db.runSync(
    'INSERT OR REPLACE INTO lessons (id, data, downloaded_at) VALUES (?, ?, ?)',
    [lessonId, JSON.stringify(lesson), Date.now()]
  );
  // Télécharger les fichiers audio
  for (const audioUrl of lesson.audio_urls) {
    await FileSystem.downloadAsync(audioUrl, getCachedAudioPath(audioUrl));
  }
}

export async function getOfflineLesson(lessonId: string) {
  const row = db.getFirstSync<{data: string}>(
    'SELECT data FROM lessons WHERE id = ?', [lessonId]
  );
  return row ? JSON.parse(row.data) : null;
}
```

## Animations Lettres Vivantes

```typescript
// packages/ui/native/fondation/LetterAnimation.tsx
import Animated, { useSharedValue, withTiming, withSequence } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export function LetterAnimation({ letter, onComplete }: LetterAnimationProps) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // 1. Apparition de la lettre
    scale.value = withSequence(withTiming(1.2, {duration: 300}), withTiming(1, {duration: 150}));
    opacity.value = withTiming(1, {duration: 300});
  }, [letter]);

  const handleTraceComplete = async (isCorrect: boolean) => {
    if (isCorrect) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // Manman Marie encourage doucement
    }
  };

  return (
    <Animated.View style={[styles.letterContainer, { transform: [{ scale }], opacity }]}>
      <Text style={styles.letter}>{letter}</Text>
      <LetterTracer letter={letter} onComplete={handleTraceComplete} />
    </Animated.View>
  );
}
```
