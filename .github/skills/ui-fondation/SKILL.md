---
name: ui-fondation
description: Skill pour l'interface utilisateur du volet Fondation de Konprann. Navigation 100% vocale, grandes icônes haïtiennes, zones tactiles 64px+, animations lettres vivantes et composants sans texte requis.
---

# UI Volet Fondation — Konprann Skill

## Composant de Base — VoiceNavigableButton

```typescript
// Tout bouton du volet Fondation DOIT utiliser ce composant
interface VoiceNavigableButtonProps {
  iconName: HaitianIconName;       // Icône haïtienne culturellement adaptée
  audioKey: string;                // Clé pour l'audio Manman Marie
  onPress: () => void;
  size?: number;                   // Min 64, défaut 80
  accessibilityLabel: string;      // En créole haïtien
}

export function VoiceNavigableButton({
  iconName, audioKey, onPress, size = 80, accessibilityLabel
}: VoiceNavigableButtonProps) {
  const { playPhrase } = useManmanMarie();

  const handlePress = async () => {
    await playPhrase(audioKey);  // Toujours confirmer vocalement
    onPress();
  };

  return (
    <TouchableOpacity
      style={{ width: size, height: size, minWidth: 64, minHeight: 64 }}
      onPress={handlePress}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <HaitianIcon name={iconName} size={size * 0.6} />
    </TouchableOpacity>
  );
}
```

## Icônes Haïtiennes Disponibles

```typescript
type HaitianIconName =
  | 'kay'          // Maison haïtienne
  | 'mache'        // Marché
  | 'lopital'      // Hôpital
  | 'lekol'        // École
  | 'mango'        // Mangue
  | 'kabrit'       // Chèvre
  | 'motosiklet'   // Moto (transport principal)
  | 'panye'        // Panier
  | 'dlo'          // Eau
  | 'solèy'        // Soleil
  | 'remèd'        // Médicament/ordonnance
  | 'lajan'        // Argent/billet
  | 'vote'         // Bulletin de vote
  | 'mesaj'        // Message/téléphone
  | 'travay'       // Travail
  | 'fanmi';       // Famille
```

## Composant Progression Visuelle

```typescript
// Barre de progression sans texte — uniquement étoiles et couleurs
export function LearnerProgress({ level, lessonsCompleted, totalLessons }: ProgressProps) {
  return (
    <View style={styles.container}>
      {/* Étoiles gagnées */}
      <View style={styles.starsRow}>
        {Array.from({ length: lessonsCompleted }).map((_, i) => (
          <StarIcon key={i} color={COLORS.gold} size={24} />
        ))}
      </View>
      {/* Barre de progression colorée */}
      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressFill, {
            width: `${(lessonsCompleted / totalLessons) * 100}%`,
            backgroundColor: COLORS.greenMid,
          }]}
        />
      </View>
      {/* Couronne pour niveau complété */}
      {lessonsCompleted === totalLessons && <CrownIcon color={COLORS.gold} size={40} />}
    </View>
  );
}
```
