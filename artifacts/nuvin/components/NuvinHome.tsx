import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Keyboard,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';

type Persona = 'elder' | 'friend';
type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';
type AudioMode = 'speaker' | 'call';
type MemoryCategory =
  | 'Health & Medication'
  | 'Family & Relationships'
  | 'Daily Preferences & Habits';
type Memory = {
  id: string;
  text: string;
  category: MemoryCategory;
  savedAt: string;
  reason: string;
};
type FeedItem =
  | { id: string; kind: 'text'; sender: 'nuvin' | 'you'; text: string }
  | { id: string; kind: 'medication' | 'crisis' }
  | { id: string; kind: 'memory'; memoryId?: string };
type MedicationStatus = 'due' | 'taken' | 'snoozed' | 'skipped' | 'help';

const KEYS = {
  persona: 'nuvin:persona',
  audio: 'nuvin:audio',
  memories: 'nuvin:memories',
  feed: 'nuvin:feed',
  medication: 'nuvin:medication',
  onboarding: 'nuvin:onboarding',
  companion: 'nuvin:companion',
  kinName: 'nuvin:kinName',
  kinPhone: 'nuvin:kinPhone',
};

const seedMemories: Memory[] = [
  {
    id: 'memory-aarav',
    text: "Grandson Aarav's birthday is coming up on October 24th.",
    category: 'Family & Relationships',
    savedAt: 'Today · 10:15 AM',
    reason: 'You asked me to remember an important family date.',
  },
  {
    id: 'memory-medicine',
    text: 'Amlodipine 5mg, one tablet with warm water in the afternoon.',
    category: 'Health & Medication',
    savedAt: 'Yesterday · 4:20 PM',
    reason: 'You shared your medicine routine so I can help with reminders.',
  },
  {
    id: 'memory-tea',
    text: 'You like a quiet cup of chai after your evening walk.',
    category: 'Daily Preferences & Habits',
    savedAt: 'Monday · 6:05 PM',
    reason: 'You mentioned this as part of your evening routine.',
  },
];

const seedFeed: FeedItem[] = [
  {
    id: 'hello',
    kind: 'text',
    sender: 'nuvin',
    text: "Good afternoon. Aapka BP medicine lene ka samay ho gaya hai. I'm right here with you.",
  },
  { id: 'medicine-card', kind: 'medication' },
  { id: 'memory-card', kind: 'memory', memoryId: 'memory-aarav' },
];

const categories: MemoryCategory[] = [
  'Health & Medication',
  'Family & Relationships',
  'Daily Preferences & Habits',
];

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function usePressFeedback() {
  return () => {
    void Haptics.selectionAsync().catch(() => undefined);
  };
}

function VoiceOrb({
  state,
  onPress,
  elderly,
}: {
  state: OrbState;
  onPress: () => void;
  elderly: boolean;
}) {
  const pulse = useSharedValue(0);
  const spin = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: state === 'speaking' ? 500 : 1600 }),
        withTiming(0, { duration: state === 'speaking' ? 500 : 1600 }),
      ),
      -1,
      false,
    );
    spin.value =
      state === 'thinking'
        ? withRepeat(
            withTiming(360, { duration: 3000, easing: Easing.linear }),
            -1,
            false,
          )
        : withTiming(0, { duration: 300 });
    ripple.value = withRepeat(
      withSequence(withTiming(1, { duration: 1150 }), withTiming(0, { duration: 0 })),
      -1,
      false,
    );
  }, [pulse, ripple, spin, state]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.96, 1.04]) }],
    opacity: interpolate(pulse.value, [0, 1], [0.62, 0.92]),
  }));
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));
  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(ripple.value, [0, 1], [0.76, 1.48]) }],
    opacity: interpolate(ripple.value, [0, 1], [0.46, 0]),
  }));

  const labels: Record<OrbState, string> = {
    idle: elderly ? 'Suniye, main yahin hoon' : 'I’m here when you’re ready',
    listening: elderly ? 'Sun rahi hoon…' : 'Listening…',
    thinking: elderly ? 'Soch rahi hoon…' : 'Thinking…',
    speaking: elderly ? 'Aap se baat kar rahi hoon' : 'Speaking…',
  };

  return (
    <View style={styles.orbSection}>
      <View style={styles.orbStage}>
        <Animated.View style={[styles.orbRipple, rippleStyle]} />
        <View style={styles.orbRingWide} />
        <View style={styles.orbRingInner} />
        <Animated.View style={[styles.orbGlow, pulseStyle]}>
          <LinearGradient
            colors={['#75F2F5', '#48CAE4', '#1788A6', '#123D64']}
            start={{ x: 0.12, y: 0.05 }}
            end={{ x: 0.92, y: 0.96 }}
            style={styles.orbFace}
          >
            <View style={styles.orbHighlight} />
            {state === 'thinking' ? (
              <Animated.View style={[styles.orbitPath, spinStyle]}>
                <View style={styles.orbitDot} />
                <View style={styles.orbitDotSmall} />
              </Animated.View>
            ) : null}
            <Ionicons
              name={state === 'speaking' ? 'volume-high' : 'mic'}
              size={30}
              color="#09233C"
            />
          </LinearGradient>
        </Animated.View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Voice orb, currently ${state}. Tap to change voice state`}
          onPress={onPress}
          style={styles.orbTouchTarget}
          testID="voice-orb"
        />
      </View>
      <Text style={[styles.orbStatus, elderly && styles.largeBody]}>{labels[state]}</Text>
      <Text style={styles.orbHint}>Tap the orb to speak, or say “Hey Nuvin”</Text>
    </View>
  );
}

function TextBubble({
  item,
  elderly,
}: {
  item: Extract<FeedItem, { kind: 'text' }>;
  elderly: boolean;
}) {
  const isUser = item.sender === 'you';
  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      {!isUser ? (
        <View style={styles.messageAvatar}>
          <Ionicons name="sparkles" size={14} color="#48CAE4" />
        </View>
      ) : null}
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.messageText, elderly && styles.largeBody]}>{item.text}</Text>
      </View>
    </View>
  );
}

function MemoryEntry({
  memory,
  elderly,
  onForget,
}: {
  memory: Memory;
  elderly: boolean;
  onForget: (id: string) => void;
}) {
  return (
    <View style={styles.memoryEntry}>
      <View style={styles.memoryEntryTop}>
        <View style={styles.memoryMark}>
          <Ionicons name="bookmark" size={16} color="#FFB703" />
        </View>
        <View style={styles.memoryEntryCopy}>
          <Text style={[styles.memoryEntryText, elderly && styles.largeBody]}>{memory.text}</Text>
          <Text style={styles.memoryWhy}>{memory.reason}</Text>
          <Text style={styles.memoryTime}>{memory.savedAt}</Text>
        </View>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Forget memory: ${memory.text}`}
        onPress={() => onForget(memory.id)}
        style={({ pressed }) => [styles.forgetLink, pressed && styles.pressed]}
        testID={`forget-${memory.id}`}
      >
        <Ionicons name="trash-outline" size={15} color="#F08A91" />
        <Text style={styles.forgetText}>Forget this</Text>
      </Pressable>
    </View>
  );
}

export default function NuvinHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pressFeedback = usePressFeedback();
  const [persona, setPersona] = useState<Persona>('elder');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [audioMode, setAudioMode] = useState<AudioMode>('speaker');
  const [feed, setFeed] = useState<FeedItem[]>(seedFeed);
  const [memories, setMemories] = useState<Memory[]>(seedMemories);
  const [medicationStatus, setMedicationStatus] = useState<MedicationStatus>('due');
  const [input, setInput] = useState('');
  const [vaultOpen, setVaultOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [companionName, setCompanionName] = useState('Nuvin');
  const [kinName, setKinName] = useState('');
  const [kinPhone, setKinPhone] = useState('');
  const [voiceSample, setVoiceSample] = useState(0);
  const [sosOpen, setSosOpen] = useState(false);
  const [sosActive, setSosActive] = useState(false);
  const [sosCount, setSosCount] = useState(5);
  const [sosComplete, setSosComplete] = useState(false);
  const [sirenPreview, setSirenPreview] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [notice, setNotice] = useState('');
  const elderly = persona === 'elder';
  const touchSize = elderly ? 56 : 46;
  const bodySize = elderly ? 20 : 15;
  const titleSize = elderly ? 28 : 22;
  const smallSize = elderly ? 15 : 12;

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const storedValues = await AsyncStorage.multiGet(Object.values(KEYS));
        if (!alive) return;
        const values = Object.fromEntries(
          Object.values(KEYS).map((key, index) => [key, storedValues[index]?.[1] ?? null]),
        ) as Record<string, string | null>;
        const savedPersona = values[KEYS.persona];
        const savedAudio = values[KEYS.audio];
        const savedMemories = values[KEYS.memories];
        const savedFeed = values[KEYS.feed];
        const savedMedication = values[KEYS.medication];
        const savedOnboarding = values[KEYS.onboarding];
        const savedCompanion = values[KEYS.companion];
        const savedKinName = values[KEYS.kinName];
        const savedKinPhone = values[KEYS.kinPhone];
        if (savedPersona === 'elder' || savedPersona === 'friend') {
          setPersona(savedPersona);
        }
        if (savedAudio === 'speaker' || savedAudio === 'call') {
          setAudioMode(savedAudio);
        }
        if (savedMemories) {
          setMemories(JSON.parse(savedMemories) as Memory[]);
        }
        if (savedFeed) setFeed(JSON.parse(savedFeed) as FeedItem[]);
        if (
          savedMedication &&
          ['due', 'taken', 'snoozed', 'skipped', 'help'].includes(savedMedication)
        ) {
          setMedicationStatus(savedMedication as MedicationStatus);
        }
        if (savedCompanion) setCompanionName(savedCompanion);
        if (savedKinName) setKinName(savedKinName);
        if (savedKinPhone) setKinPhone(savedKinPhone);
        setOnboardingOpen(savedOnboarding !== 'complete');
      } catch {
        if (alive) {
          setOnboardingOpen(true);
          Alert.alert(
            'Could not load saved details',
            'Nuvin could not read the information saved on this device.',
          );
        }
      } finally {
        if (alive) setHydrated(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!sosOpen || !sosActive || sosComplete) return undefined;
    if (sosCount <= 0) {
      setSosComplete(true);
      setSosActive(false);
      return undefined;
    }
    const timer = setTimeout(() => setSosCount((count) => count - 1), 1000);
    return () => clearTimeout(timer);
  }, [sosActive, sosComplete, sosCount, sosOpen]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.multiSet([
      [KEYS.persona, persona],
      [KEYS.audio, audioMode],
      [KEYS.memories, JSON.stringify(memories)],
      [KEYS.feed, JSON.stringify(feed)],
      [KEYS.medication, medicationStatus],
      [KEYS.companion, companionName],
      [KEYS.kinName, kinName],
      [KEYS.kinPhone, kinPhone],
    ]).catch(() => {
      Alert.alert('Could not save changes', 'Please check that storage is available on this device.');
    });
  }, [
    audioMode,
    companionName,
    feed,
    hydrated,
    kinName,
    kinPhone,
    medicationStatus,
    memories,
    persona,
  ]);

  const statusLabel = useMemo(() => {
    if (medicationStatus === 'taken') return 'Marked as taken';
    if (medicationStatus === 'snoozed') return 'Snoozed for 15 minutes';
    if (medicationStatus === 'skipped') return 'Skipped for today';
    if (medicationStatus === 'help') return 'Help requested';
    return 'Due this afternoon';
  }, [medicationStatus]);

  const speak = () => {
    pressFeedback();
    setOrbState((current) => {
      const sequence: OrbState[] = ['idle', 'listening', 'thinking', 'speaking'];
      return sequence[(sequence.indexOf(current) + 1) % sequence.length];
    });
  };

  const completeOnboarding = () => {
    setOnboardingOpen(false);
    setOnboardingStep(0);
    void AsyncStorage.setItem(KEYS.onboarding, 'complete').catch(() => {
      Alert.alert('Setup not saved', 'Please try again when your device is available.');
    });
  };

  const forgetMemory = (id: string) => {
    pressFeedback();
    setMemories((current) => current.filter((memory) => memory.id !== id));
    setFeed((current) =>
      current.filter((item) => !(item.kind === 'memory' && item.memoryId === id)),
    );
    setNotice('Memory deleted from this device.');
    setTimeout(() => setNotice(''), 2800);
  };

  const medicationAction = (action: MedicationStatus) => {
    pressFeedback();
    setMedicationStatus(action);
    if (action === 'help') {
      Alert.alert(
        'Help request preview',
        kinName
          ? `A caregiver alert for ${kinName} would appear here. Nothing has been sent.`
          : 'Add an emergency contact in setup to preview who would be notified. Nothing has been sent.',
      );
      return;
    }
    const copy: Record<MedicationStatus, string> = {
      due: 'Your reminder is ready.',
      taken: 'Thank you for letting me know. I’ve marked this reminder as taken.',
      snoozed: 'Of course. I’ll remind you again in 15 minutes.',
      skipped: 'I’ve marked today’s reminder as skipped.',
      help: 'I’m showing a help request preview.',
    };
    setFeed((current) => [
      ...current,
      { id: makeId(), kind: 'text', sender: 'nuvin', text: copy[action] },
    ]);
  };

  const sendText = () => {
    const message = input.trim();
    if (!message) return;
    pressFeedback();
    setInput('');
    Keyboard.dismiss();
    const lower = message.toLowerCase();
    const distress = /(suicid|kill myself|hurt myself|self harm|hopeless|can't go on|unsafe|want to die|marna|jeena nahi|khud ko)/i.test(
      lower,
    );
    const asksToRemember = /^(please )?remember\b/i.test(message);
    const response = distress
      ? 'I’m really glad you told me. You deserve support from a person right now. If you may be in immediate danger, call your local emergency number.'
      : asksToRemember
        ? 'I can save that in your Memory Vault. You can review or delete it any time.'
        : elderly
          ? 'Ji, main sun rahi hoon. Aap aaram se bataiye — kya aap chahenge ki hum iske baare mein baat karein?'
          : 'I’m here with you. Want to tell me a little more?';
    const next: FeedItem[] = [
      { id: makeId(), kind: 'text', sender: 'you', text: message },
      { id: makeId(), kind: 'text', sender: 'nuvin', text: response },
    ];
    if (distress) next.push({ id: makeId(), kind: 'crisis' });
    if (asksToRemember) {
      const rememberedText = message.replace(/^(please )?remember( that)?\s*/i, '');
      if (rememberedText) {
        const memory: Memory = {
          id: makeId(),
          text: rememberedText,
          category: 'Daily Preferences & Habits',
          savedAt: 'Just now',
          reason: 'You asked me to remember this.',
        };
        setMemories((current) => [memory, ...current]);
        next.push({ id: makeId(), kind: 'memory', memoryId: memory.id });
      }
    }
    setFeed((current) => [...current, ...next]);
    setOrbState('speaking');
  };

  const openHelpline = async (number: string) => {
    try {
      await Linking.openURL(`tel:${number}`);
    } catch {
      Alert.alert('Calling unavailable', `Dial ${number} from your phone to reach support.`);
    }
  };

  const openSos = () => {
    pressFeedback();
    setSosActive(false);
    setSosComplete(false);
    setSosCount(5);
    setSosOpen(true);
  };

  const startSosPreview = () => {
    setSosCount(5);
    setSosComplete(false);
    setSosActive(true);
  };

  const renderFeedItem = (item: FeedItem) => {
    if (item.kind === 'text') return <TextBubble key={item.id} item={item} elderly={elderly} />;
    if (item.kind === 'medication') {
      return (
        <View key={item.id} style={styles.actionCard}>
          <View style={styles.cardHeadingRow}>
            <View style={[styles.iconTile, { backgroundColor: 'rgba(255,183,3,0.13)' }]}>
              <Ionicons name="medkit-outline" size={20} color="#FFB703" />
            </View>
            <View style={styles.cardTitleCopy}>
              <Text style={[styles.cardTitle, { fontSize: elderly ? 20 : 16 }]}>
                Afternoon blood pressure medicine
              </Text>
              <Text style={styles.cardEyebrow}>{statusLabel}</Text>
            </View>
          </View>
          <View style={styles.medicineDetail}>
            <Text style={[styles.cardBody, elderly && styles.largeBody]}>
              Amlodipine 5mg · 1 tablet with warm water
            </Text>
          </View>
          {medicationStatus === 'due' ? (
            <View style={styles.actionGrid}>
              <ActionPill
                label="Taken"
                icon="checkmark-circle-outline"
                tone="success"
                elderly={elderly}
                onPress={() => medicationAction('taken')}
              />
              <ActionPill
                label="Snooze 15m"
                icon="time-outline"
                tone="neutral"
                elderly={elderly}
                onPress={() => medicationAction('snoozed')}
              />
              <ActionPill
                label="Skip today"
                icon="play-skip-forward-outline"
                tone="neutral"
                elderly={elderly}
                onPress={() => medicationAction('skipped')}
              />
              <ActionPill
                label="Need help"
                icon="help-buoy-outline"
                tone="danger"
                elderly={elderly}
                onPress={() => medicationAction('help')}
              />
            </View>
          ) : (
            <View style={styles.doneStatus}>
              <Ionicons
                name={medicationStatus === 'taken' ? 'checkmark-circle' : 'information-circle'}
                size={18}
                color={medicationStatus === 'taken' ? '#64DDAA' : '#FFB703'}
              />
              <Text style={styles.doneStatusText}>{statusLabel}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Undo medication reminder action"
                onPress={() => medicationAction('due')}
                style={styles.undoButton}
              >
                <Text style={styles.undoText}>Undo</Text>
              </Pressable>
            </View>
          )}
        </View>
      );
    }
    if (item.kind === 'memory') {
      const saved = memories.find((memory) => memory.id === (item.memoryId ?? 'memory-aarav'));
      if (!saved) return null;
      return (
        <View key={item.id} style={styles.actionCard}>
          <View style={styles.cardHeadingRow}>
            <View style={[styles.iconTile, { backgroundColor: 'rgba(72,202,228,0.13)' }]}>
              <Ionicons name="bookmark-outline" size={19} color="#48CAE4" />
            </View>
            <View style={styles.cardTitleCopy}>
              <Text style={styles.cardTitle}>Memory saved</Text>
              <Text style={styles.cardEyebrow}>Only on this device</Text>
            </View>
          </View>
          <Text style={[styles.cardBody, styles.memoryCardQuote, elderly && styles.largeBody]}>
            Nuvin noted: “{saved.text}”
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Forget this memory"
            onPress={() => forgetMemory(saved.id)}
            style={({ pressed }) => [styles.forgetCardButton, pressed && styles.pressed]}
          >
            <Ionicons name="trash-outline" size={16} color="#F08A91" />
            <Text style={styles.forgetText}>Forget this</Text>
          </Pressable>
        </View>
      );
    }
    return (
      <View key={item.id} style={[styles.actionCard, styles.crisisCard]}>
        <View style={styles.cardHeadingRow}>
          <View style={[styles.iconTile, { backgroundColor: 'rgba(72,202,228,0.13)' }]}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#48CAE4" />
          </View>
          <View style={styles.cardTitleCopy}>
            <Text style={styles.cardTitle}>We are here with you</Text>
            <Text style={styles.cardEyebrow}>You can speak to a trained person</Text>
          </View>
        </View>
        <Text style={styles.cardBody}>
          If you’re in immediate danger, call your local emergency number.
        </Text>
        <View style={styles.helplineRow}>
          <HelplinePill
            label="Tele-MANAS · 14416"
            onPress={() => void openHelpline('14416')}
          />
          <HelplinePill
            label="KIRAN · 1800-599-0019"
            onPress={() => void openHelpline('1800-599-0019')}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.appRoot, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior="padding"
        keyboardVerticalOffset={0}
        style={[
          styles.phoneFrame,
          Platform.OS === 'web' && styles.webPhoneFrame,
          {
            paddingTop: Platform.OS === 'web' ? 67 : insets.top,
            paddingBottom: Platform.OS === 'web' ? 34 : 0,
          },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.brand}>
            <View style={styles.brandMark}>
              <Ionicons name="pulse" size={20} color="#0B132B" />
            </View>
            <View>
              <Text style={styles.brandName}>nuvin</Text>
              <View style={styles.onlineRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineLabel}>Here with you</Text>
              </View>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open Memory Vault"
              onPress={() => {
                pressFeedback();
                setVaultOpen(true);
              }}
              style={({ pressed }) => [
                styles.headerIconButton,
                { minWidth: touchSize, minHeight: touchSize },
                pressed && styles.pressed,
              ]}
              testID="open-vault"
            >
              <Ionicons name="bookmark-outline" size={20} color="#B6C5D8" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open emergency safety preview"
              onPress={openSos}
              style={({ pressed }) => [
                styles.sosButton,
                { minHeight: touchSize },
                pressed && styles.pressed,
              ]}
              testID="open-sos"
            >
              <Ionicons name="alert-circle" size={18} color="#FFFFFF" />
              <Text style={styles.sosButtonText}>SOS</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.personaRail}>
          <Text style={[styles.personaPrompt, { fontSize: smallSize }]}>Your space</Text>
          <View style={styles.personaSegment}>
            <PersonaChoice
              active={persona === 'elder'}
              elderly={elderly}
              icon="sunny-outline"
              label="Elder · 55+"
              onPress={() => {
                pressFeedback();
                setPersona('elder');
              }}
            />
            <PersonaChoice
              active={persona === 'friend'}
              elderly={elderly}
              icon="headset-outline"
              label="Ear · 20–50"
              onPress={() => {
                pressFeedback();
                setPersona('friend');
              }}
            />
          </View>
        </View>

        <ScrollView
          style={styles.mainScroll}
          contentContainerStyle={styles.mainContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.welcomeLine}>
            <View>
              <Text style={styles.dayLabel}>A LITTLE SPACE FOR YOU</Text>
              <Text style={[styles.welcomeTitle, { fontSize: titleSize }]}>
                {elderly ? 'Namaste, ji.' : 'Take a breath.'}
              </Text>
            </View>
            <View style={styles.privateTag}>
              <Ionicons name="lock-closed-outline" size={11} color="#7FDDEA" />
              <Text style={styles.privateText}>On this device</Text>
            </View>
          </View>

          <VoiceOrb state={orbState} onPress={speak} elderly={elderly} />

          <View style={styles.streamHeading}>
            <View>
              <Text style={styles.streamTitle}>A moment together</Text>
              <Text style={styles.streamSubhead}>Small things, at your pace</Text>
            </View>
            <View style={styles.todayPill}>
              <View style={styles.onlineDot} />
              <Text style={styles.todayText}>Today</Text>
            </View>
          </View>

          <View style={styles.feed}>
            {feed.map((item) => renderFeedItem(item))}
          </View>
          <View style={styles.disclaimer}>
            <Ionicons name="information-circle-outline" size={14} color="#8493AA" />
            <Text style={styles.disclaimerText}>
              Conversation preview · replies are saved on this device
            </Text>
          </View>
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.audioModes}>
            <Text style={styles.audioLabel}>AUDIO</Text>
            <View style={styles.audioChoices}>
              <AudioChoice
                active={audioMode === 'speaker'}
                elderly={elderly}
                icon="volume-high-outline"
                label="Speaker"
                onPress={() => {
                  pressFeedback();
                  setAudioMode('speaker');
                }}
              />
              <AudioChoice
                active={audioMode === 'call'}
                elderly={elderly}
                icon="call-outline"
                label="Call mode"
                onPress={() => {
                  pressFeedback();
                  setAudioMode('call');
                }}
              />
            </View>
            {audioMode === 'call' ? (
              <Text style={styles.audioNote}>Private earpiece mode selected</Text>
            ) : null}
          </View>
          <View style={styles.inputRow}>
            <TextInput
              accessibilityLabel="Write a message to Nuvin"
              accessibilityHint="Enter a thought, question, or reminder"
              value={input}
              onChangeText={setInput}
              onSubmitEditing={sendText}
              placeholder={elderly ? 'Aap kya soch rahe hain?' : 'Type a thought or question…'}
              placeholderTextColor="#8290A4"
              returnKeyType="send"
              blurOnSubmit
              style={[
                styles.textInput,
                { fontSize: elderly ? 17 : 15, minHeight: touchSize },
              ]}
              testID="message-input"
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Start or change voice mode"
              onPress={speak}
              style={({ pressed }) => [
                styles.micButton,
                { width: touchSize, height: touchSize },
                pressed && styles.pressed,
              ]}
              testID="voice-toggle"
            >
              <Ionicons name="mic-outline" size={21} color="#48CAE4" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Send message"
              onPress={sendText}
              disabled={!input.trim()}
              style={({ pressed }) => [
                styles.sendButton,
                { width: touchSize, height: touchSize },
                !input.trim() && styles.sendDisabled,
                pressed && styles.pressed,
              ]}
              testID="send-message"
            >
              <Ionicons name="arrow-up" size={22} color="#0B132B" />
            </Pressable>
          </View>
          {notice ? <Text accessibilityLiveRegion="polite" style={styles.notice}>{notice}</Text> : null}
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={vaultOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setVaultOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close Memory Vault"
            onPress={() => setVaultOpen(false)}
            style={styles.backdropDismiss}
          />
          <View
            style={[
              styles.vaultPanel,
              { paddingTop: Math.max(insets.top, 20), paddingBottom: Math.max(insets.bottom, 18) },
            ]}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.drawerHeader}>
              <View>
                <Text style={styles.drawerKicker}>YOUR PRIVATE SPACE</Text>
                <Text style={styles.drawerTitle}>Memory Vault</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close Memory Vault"
                onPress={() => setVaultOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={21} color="#C7D3E2" />
              </Pressable>
            </View>
            <Text style={styles.drawerIntro}>
              You’re in control. Memories stay on this device, and you can forget any of them at any time.
            </Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.memoryList}>
              {categories.map((category) => {
                const group = memories.filter((memory) => memory.category === category);
                return (
                  <View key={category} style={styles.memoryGroup}>
                    <View style={styles.memoryGroupHeading}>
                      <Text style={styles.memoryCategory}>{category}</Text>
                      <Text style={styles.memoryCount}>{group.length}</Text>
                    </View>
                    {group.length ? (
                      group.map((memory) => (
                        <MemoryEntry
                          key={memory.id}
                          memory={memory}
                          elderly={elderly}
                          onForget={forgetMemory}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyMemory}>No saved memories in this section.</Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
            <View style={styles.vaultPrivacyFoot}>
              <Ionicons name="shield-checkmark-outline" size={16} color="#48CAE4" />
              <Text style={styles.vaultFootText}>Stored locally · never sent from this demo</Text>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={onboardingOpen}
        animationType="fade"
        transparent
        onRequestClose={completeOnboarding}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.onboardingCard}>
            <View style={styles.onboardingTop}>
              <View style={styles.brandMark}>
                <Ionicons name="pulse" size={20} color="#0B132B" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Skip setup"
                onPress={completeOnboarding}
                style={styles.skipButton}
              >
                <Text style={styles.skipText}>Skip for now</Text>
              </Pressable>
            </View>
            <View style={styles.progressRail}>
              <View style={[styles.progressFill, { width: `${((onboardingStep + 1) / 4) * 100}%` }]} />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.onboardingScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.onboardingStepText}>STEP {onboardingStep + 1} OF 4</Text>
              {onboardingStep === 0 ? (
                <>
                  <Text style={styles.onboardingTitle}>Welcome to Nuvin</Text>
                  <Text style={styles.onboardingCopy}>
                    A calm place to talk, reflect, and keep the little things that matter. Choose how you’d like Nuvin to speak with you.
                  </Text>
                  <PersonaOnboardingChoice
                    active={persona === 'elder'}
                    elderly
                    title="Elder mode · 55+"
                    description="Larger text, simpler prompts, a respectful tone."
                    icon="sunny-outline"
                    onPress={() => setPersona('elder')}
                  />
                  <PersonaOnboardingChoice
                    active={persona === 'friend'}
                    elderly
                    title="Ear mode · 20–50"
                    description="A warm, peer-like space to unwind and reflect."
                    icon="headset-outline"
                    onPress={() => setPersona('friend')}
                  />
                </>
              ) : null}
              {onboardingStep === 1 ? (
                <>
                  <Text style={styles.onboardingTitle}>What should I call myself?</Text>
                  <Text style={styles.onboardingCopy}>
                    You can use Nuvin or choose another name for your companion.
                  </Text>
                  <Text style={styles.fieldLabel}>COMPANION NAME</Text>
                  <TextInput
                    accessibilityLabel="Companion name"
                    value={companionName}
                    onChangeText={setCompanionName}
                    placeholder="Nuvin"
                    placeholderTextColor="#8290A4"
                    style={styles.onboardingInput}
                    maxLength={28}
                  />
                  <View style={styles.suggestionRow}>
                    {['Nuvin', 'Saathi', 'Mitra'].map((name) => (
                      <Pressable
                        key={name}
                        onPress={() => setCompanionName(name)}
                        style={[styles.nameSuggestion, companionName === name && styles.nameSuggestionActive]}
                      >
                        <Text style={[styles.nameSuggestionText, companionName === name && styles.nameSuggestionTextActive]}>{name}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : null}
              {onboardingStep === 2 ? (
                <>
                  <Text style={styles.onboardingTitle}>A person you trust</Text>
                  <Text style={styles.onboardingCopy}>
                    Add a trusted contact if you’d like. This demo never sends an alert or SMS.
                  </Text>
                  <Text style={styles.fieldLabel}>CONTACT NAME · OPTIONAL</Text>
                  <TextInput
                    accessibilityLabel="Emergency contact name"
                    value={kinName}
                    onChangeText={setKinName}
                    placeholder="Their name"
                    placeholderTextColor="#8290A4"
                    style={styles.onboardingInput}
                    maxLength={50}
                  />
                  <Text style={[styles.fieldLabel, { marginTop: 16 }]}>PHONE NUMBER · OPTIONAL</Text>
                  <TextInput
                    accessibilityLabel="Emergency contact phone number"
                    value={kinPhone}
                    onChangeText={setKinPhone}
                    placeholder="+91 98765 43210"
                    placeholderTextColor="#8290A4"
                    keyboardType="phone-pad"
                    style={styles.onboardingInput}
                    maxLength={24}
                  />
                  <View style={styles.privacyNote}>
                    <Ionicons name="lock-closed-outline" size={15} color="#48CAE4" />
                    <Text style={styles.privacyNoteText}>Saved on this device only.</Text>
                  </View>
                </>
              ) : null}
              {onboardingStep === 3 ? (
                <>
                  <Text style={styles.onboardingTitle}>Find a voice that feels right</Text>
                  <Text style={styles.onboardingCopy}>
                    Choose a sample to preview. No microphone recording is made in this setup.
                  </Text>
                  <View style={styles.voiceSampleList}>
                    {['Calm and gentle', 'Warm and familiar', 'Clear and steady'].map((sample, index) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Preview voice sample: ${sample}`}
                        key={sample}
                        onPress={() => {
                          setVoiceSample(index);
                          setOrbState('speaking');
                          pressFeedback();
                        }}
                        style={[styles.voiceSample, voiceSample === index && styles.voiceSampleActive]}
                      >
                        <View style={styles.sampleIcon}>
                          <Ionicons
                            name={voiceSample === index ? 'volume-high' : 'play'}
                            size={17}
                            color={voiceSample === index ? '#48CAE4' : '#AAB7C9'}
                          />
                        </View>
                        <Text style={styles.voiceSampleText}>{sample}</Text>
                        <View style={styles.sampleBars}>
                          {[8, 15, 10, 19, 12].map((height, i) => (
                            <View key={i} style={[styles.sampleBar, { height }]} />
                          ))}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.voicePreviewNotice}>
                    Voice enrollment is a visual preview only. Microphone access is not used.
                  </Text>
                </>
              ) : null}
            </ScrollView>
            <View style={styles.onboardingFooter}>
              {onboardingStep > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to previous setup step"
                  onPress={() => setOnboardingStep((step) => Math.max(0, step - 1))}
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={19} color="#B8C6D8" />
                </Pressable>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  pressFeedback();
                  if (onboardingStep === 3) completeOnboarding();
                  else setOnboardingStep((step) => step + 1);
                }}
                style={styles.continueButton}
                testID="onboarding-continue"
              >
                <Text style={styles.continueText}>
                  {onboardingStep === 3 ? 'Start with Nuvin' : 'Continue'}
                </Text>
                <Ionicons name={onboardingStep === 3 ? 'checkmark' : 'arrow-forward'} size={18} color="#0B132B" />
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={sosOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setSosOpen(false)}
      >
        <View style={styles.sosBackdrop}>
          <LinearGradient
            colors={['rgba(230,57,70,0.15)', 'rgba(255,183,3,0.08)', 'rgba(11,19,43,0.98)']}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.sosPanel, { paddingTop: Math.max(insets.top, 24), paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={styles.sosModalHeader}>
              <View style={styles.sosShield}>
                <Ionicons name="shield-half-outline" size={27} color="#FFB703" />
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close SOS safety preview"
                onPress={() => setSosOpen(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={21} color="#C7D3E2" />
              </Pressable>
            </View>
            <Text style={styles.sosTitle}>
              {sosComplete ? 'Preview complete' : sosActive ? `Starting in ${sosCount}` : 'Safety check'}
            </Text>
            <Text style={styles.sosDescription}>
              {sosComplete
                ? 'This was only a simulation. No message was sent, and no location was shared.'
                : 'A short preview of what an emergency flow could look like. You can cancel at any time.'}
            </Text>
            <View style={styles.sosContactCard}>
              <View style={styles.sosContactIcon}>
                <Ionicons name="person-outline" size={19} color="#FFB703" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sosCardLabel}>PRIMARY CONTACT</Text>
                <Text style={styles.sosCardValue}>
                  {kinName || 'No contact added'}
                  {kinPhone ? ` · ${kinPhone}` : ''}
                </Text>
              </View>
              <Ionicons name="chatbubble-ellipses-outline" size={19} color="#AAB7C9" />
            </View>
            <View style={styles.mapPreview}>
              <View style={styles.mapGridLineHorizontal} />
              <View style={styles.mapGridLineVertical} />
              <View style={styles.mapRoadOne} />
              <View style={styles.mapRoadTwo} />
              <View style={styles.mapPin}>
                <Ionicons name="location" size={22} color="#E63946" />
              </View>
              <View style={styles.mapLabel}>
                <Ionicons name="location-outline" size={13} color="#B8C6D8" />
                <Text style={styles.mapLabelText}>Location preview · not live</Text>
              </View>
              <Text style={styles.mapShareBadge}>8-hour sharing preview</Text>
            </View>
            <View style={styles.sirenRow}>
              <View style={styles.sirenIcon}>
                <Ionicons name="volume-medium-outline" size={18} color="#FFB703" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sirenTitle}>Siren preview</Text>
                <Text style={styles.sirenCaption}>Visual indicator only · no sound</Text>
              </View>
              <Switch
                accessibilityLabel="Toggle siren visual preview"
                value={sirenPreview}
                onValueChange={setSirenPreview}
                trackColor={{ false: '#34415A', true: '#B88A2D' }}
                thumbColor={sirenPreview ? '#FFB703' : '#D1D8E2'}
                testID="siren-preview-toggle"
              />
            </View>
            {sosComplete ? (
              <View style={styles.sosCompleteBadge}>
                <Ionicons name="checkmark-circle" size={19} color="#64DDAA" />
                <Text style={styles.sosCompleteText}>Simulation ended — nothing was sent</Text>
              </View>
            ) : null}
            <View style={styles.sosActions}>
              {!sosActive && !sosComplete ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={startSosPreview}
                  style={({ pressed }) => [styles.startSosButton, pressed && styles.pressed]}
                  testID="start-sos-preview"
                >
                  <Ionicons name="alert-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.startSosText}>Start 5-second preview</Text>
                </Pressable>
              ) : null}
              {sosActive ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setSosActive(false);
                    setSosOpen(false);
                  }}
                  style={({ pressed }) => [styles.cancelSosButton, pressed && styles.pressed]}
                  testID="cancel-sos"
                >
                  <Text style={styles.cancelSosText}>Cancel preview</Text>
                </Pressable>
              ) : null}
              {sosComplete ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setSosOpen(false)}
                  style={styles.cancelSosButton}
                >
                  <Text style={styles.cancelSosText}>Close</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.sosDisclaimer}>
              Demo only · Nuvin does not contact emergency services or share your location.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function PersonaChoice({
  active,
  elderly,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  elderly: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.personaChoice,
        { minHeight: elderly ? 56 : 46 },
        active && styles.personaChoiceActive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={16} color={active ? '#48CAE4' : '#9EACC0'} />
      <Text style={[styles.personaChoiceText, active && styles.personaChoiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

function PersonaOnboardingChoice({
  active,
  elderly,
  title,
  description,
  icon,
  onPress,
}: {
  active: boolean;
  elderly: boolean;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.onboardingPersona,
        active && styles.onboardingPersonaActive,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.onboardingPersonaIcon}>
        <Ionicons name={icon} size={21} color={active ? '#48CAE4' : '#9EACC0'} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.onboardingPersonaTitle, elderly && styles.largeBody]}>{title}</Text>
        <Text style={styles.onboardingPersonaDescription}>{description}</Text>
      </View>
      <Ionicons
        name={active ? 'radio-button-on' : 'radio-button-off'}
        size={20}
        color={active ? '#48CAE4' : '#65758B'}
      />
    </Pressable>
  );
}

function ActionPill({
  label,
  icon,
  tone,
  elderly,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'success' | 'neutral' | 'danger';
  elderly: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionPill,
        { minHeight: elderly ? 56 : 44 },
        tone === 'success' && styles.actionSuccess,
        tone === 'danger' && styles.actionDanger,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name={icon}
        size={17}
        color={tone === 'success' ? '#64DDAA' : tone === 'danger' ? '#F08A91' : '#B8C6D8'}
      />
      <Text
        style={[
          styles.actionPillText,
          tone === 'success' && styles.actionSuccessText,
          tone === 'danger' && styles.actionDangerText,
          elderly && { fontSize: 15 },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function HelplinePill({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={onPress}
      style={({ pressed }) => [styles.helplineButton, pressed && styles.pressed]}
    >
      <Ionicons name="call-outline" size={15} color="#48CAE4" />
      <Text style={styles.helplineText}>{label}</Text>
    </Pressable>
  );
}

function AudioChoice({
  active,
  elderly,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  elderly: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.audioChoice,
        { minHeight: elderly ? 52 : 40 },
        active && styles.audioChoiceActive,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons name={icon} size={16} color={active ? '#48CAE4' : '#AAB7C9'} />
      <Text style={[styles.audioChoiceText, active && styles.audioChoiceTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  phoneFrame: {
    flex: 1,
    width: '100%',
  },
  webPhoneFrame: {
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  header: {
    minHeight: 62,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    height: 38,
    width: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#48CAE4',
  },
  brandName: {
    color: '#F3F7FB',
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#64DDAA',
  },
  onlineLabel: {
    color: '#99A9BE',
    fontSize: 10,
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  headerIconButton: {
    minWidth: 46,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  sosButton: {
    flexDirection: 'row',
    minHeight: 46,
    minWidth: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 11,
    borderRadius: 16,
    backgroundColor: '#D93B4B',
  },
  sosButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  personaRail: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  personaPrompt: {
    color: '#8290A4',
    fontSize: 11,
    marginBottom: 7,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  personaSegment: {
    flexDirection: 'row',
    padding: 4,
    gap: 4,
    borderRadius: 16,
    backgroundColor: '#111D36',
  },
  personaChoice: {
    flex: 1,
    minHeight: 46,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  personaChoiceActive: {
    backgroundColor: '#1C2B49',
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.28)',
  },
  personaChoiceText: {
    color: '#9EACC0',
    fontSize: 12,
    fontWeight: '600',
  },
  personaChoiceTextActive: {
    color: '#E8F8FC',
  },
  mainScroll: {
    flex: 1,
  },
  mainContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 25,
  },
  welcomeLine: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: -1,
  },
  dayLabel: {
    color: '#8290A4',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  welcomeTitle: {
    color: '#F3F7FB',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: -0.4,
  },
  privateTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(72,202,228,0.08)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginBottom: 4,
  },
  privateText: {
    fontSize: 9,
    color: '#A5CED7',
    fontWeight: '600',
  },
  orbSection: {
    alignItems: 'center',
    paddingTop: 1,
    paddingBottom: 12,
  },
  orbStage: {
    height: 190,
    width: 230,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbRipple: {
    position: 'absolute',
    width: 125,
    height: 125,
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.55)',
    borderRadius: 100,
    backgroundColor: 'rgba(72,202,228,0.045)',
  },
  orbRingWide: {
    position: 'absolute',
    width: 174,
    height: 174,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.08)',
  },
  orbRingInner: {
    position: 'absolute',
    width: 143,
    height: 143,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.17)',
  },
  orbGlow: {
    width: 122,
    height: 122,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#48CAE4',
    shadowOpacity: 0.4,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 14,
  },
  orbFace: {
    width: 122,
    height: 122,
    overflow: 'hidden',
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(204,255,255,0.7)',
  },
  orbHighlight: {
    position: 'absolute',
    width: 72,
    height: 40,
    borderRadius: 40,
    top: 11,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.21)',
    transform: [{ rotate: '-30deg' }],
  },
  orbitPath: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 90,
    borderWidth: 1,
    borderColor: 'rgba(255,183,3,0.4)',
    alignItems: 'center',
  },
  orbitDot: {
    width: 9,
    height: 9,
    marginTop: -4,
    borderRadius: 8,
    backgroundColor: '#FFB703',
    shadowColor: '#FFB703',
    shadowOpacity: 0.8,
    shadowRadius: 9,
    elevation: 4,
  },
  orbitDotSmall: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 5,
    top: 76,
    right: -2,
    backgroundColor: '#FFD166',
  },
  orbTouchTarget: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 100,
  },
  orbStatus: {
    marginTop: -1,
    color: '#E8F5F7',
    fontSize: 17,
    fontWeight: '600',
  },
  orbHint: {
    color: '#8C9BB0',
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
  largeBody: {
    fontSize: 20,
    lineHeight: 29,
  },
  streamHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 11,
    marginBottom: 12,
  },
  streamTitle: {
    color: '#F0F4F8',
    fontSize: 16,
    fontWeight: '700',
  },
  streamSubhead: {
    color: '#8290A4',
    fontSize: 11,
    marginTop: 3,
  },
  todayPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  todayText: {
    color: '#AAB7C9',
    fontSize: 10,
    fontWeight: '600',
  },
  feed: {
    gap: 11,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 25,
    height: 25,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C2B49',
    marginBottom: 3,
  },
  bubble: {
    maxWidth: '88%',
    borderRadius: 17,
    paddingVertical: 11,
    paddingHorizontal: 13,
  },
  assistantBubble: {
    backgroundColor: '#18243D',
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.055)',
  },
  userBubble: {
    backgroundColor: '#183E51',
    borderBottomRightRadius: 5,
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.2)',
  },
  messageText: {
    color: '#E2EAF2',
    fontSize: 14,
    lineHeight: 21,
  },
  actionCard: {
    marginLeft: 32,
    padding: 14,
    borderRadius: 19,
    backgroundColor: '#17233D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  cardHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconTile: {
    width: 39,
    height: 39,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCopy: {
    flex: 1,
  },
  cardTitle: {
    color: '#F0F4F8',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    textTransform: 'capitalize',
  },
  cardEyebrow: {
    marginTop: 3,
    color: '#8F9EB3',
    fontSize: 10,
    lineHeight: 15,
  },
  medicineDetail: {
    marginTop: 12,
    borderRadius: 12,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  cardBody: {
    color: '#BAC6D5',
    fontSize: 13,
    lineHeight: 19,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 11,
  },
  actionPill: {
    minHeight: 44,
    width: '48%',
    flexGrow: 1,
    flexBasis: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#202D49',
  },
  actionSuccess: {
    borderColor: 'rgba(100,221,170,0.26)',
    backgroundColor: 'rgba(100,221,170,0.08)',
  },
  actionDanger: {
    borderColor: 'rgba(230,57,70,0.3)',
    backgroundColor: 'rgba(230,57,70,0.08)',
  },
  actionPillText: {
    color: '#C4D0DE',
    fontSize: 11,
    fontWeight: '600',
  },
  actionSuccessText: {
    color: '#8DE6BE',
  },
  actionDangerText: {
    color: '#F29BA2',
  },
  doneStatus: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    minHeight: 34,
  },
  doneStatusText: {
    flex: 1,
    color: '#C5D1DF',
    fontSize: 12,
  },
  undoButton: {
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  undoText: {
    color: '#75D9E7',
    fontSize: 12,
    fontWeight: '600',
  },
  memoryCardQuote: {
    marginTop: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#48CAE4',
  },
  forgetCardButton: {
    alignSelf: 'flex-start',
    minHeight: 40,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    marginTop: 7,
    paddingHorizontal: 3,
  },
  forgetText: {
    color: '#F08A91',
    fontSize: 12,
    fontWeight: '600',
  },
  crisisCard: {
    borderColor: 'rgba(72,202,228,0.24)',
  },
  helplineRow: {
    gap: 8,
    marginTop: 12,
  },
  helplineButton: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 11,
    borderRadius: 12,
    backgroundColor: 'rgba(72,202,228,0.075)',
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.18)',
  },
  helplineText: {
    color: '#B9EAF0',
    fontSize: 12,
    fontWeight: '600',
  },
  disclaimer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    paddingTop: 11,
    paddingBottom: 4,
  },
  disclaimerText: {
    color: '#8493AA',
    fontSize: 10,
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.075)',
    paddingHorizontal: 16,
    paddingTop: 9,
    backgroundColor: '#0E1830',
  },
  audioModes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  audioLabel: {
    color: '#8090A7',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  audioChoices: {
    flexDirection: 'row',
    gap: 6,
  },
  audioChoice: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderRadius: 12,
    paddingHorizontal: 11,
  },
  audioChoiceActive: {
    borderColor: 'rgba(72,202,228,0.32)',
    backgroundColor: 'rgba(72,202,228,0.09)',
  },
  audioChoiceText: {
    color: '#AAB7C9',
    fontSize: 11,
    fontWeight: '600',
  },
  audioChoiceTextActive: {
    color: '#D6F7FA',
  },
  audioNote: {
    position: 'absolute',
    left: 0,
    bottom: -13,
    color: '#8493AA',
    fontSize: 9,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.105)',
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#EDF3F8',
    backgroundColor: '#15213A',
  },
  micButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.22)',
    backgroundColor: 'rgba(72,202,228,0.08)',
  },
  sendButton: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#48CAE4',
  },
  sendDisabled: {
    opacity: 0.38,
  },
  notice: {
    color: '#9FE4CC',
    fontSize: 11,
    paddingTop: 4,
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(3,8,19,0.74)',
  },
  backdropDismiss: {
    ...StyleSheet.absoluteFill,
  },
  vaultPanel: {
    height: '91%',
    width: '100%',
    maxWidth: 640,
    alignSelf: 'center',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: '#111D35',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#53617A',
    marginTop: 8,
    marginBottom: 19,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerKicker: {
    color: '#68C9D8',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  drawerTitle: {
    color: '#F1F5F8',
    fontSize: 27,
    fontWeight: '700',
    marginTop: 4,
  },
  closeButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  drawerIntro: {
    color: '#AAB7C9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 18,
  },
  memoryList: {
    paddingBottom: 18,
  },
  memoryGroup: {
    marginBottom: 21,
  },
  memoryGroupHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  memoryCategory: {
    color: '#E2EAF2',
    fontSize: 14,
    fontWeight: '700',
  },
  memoryCount: {
    color: '#91A1B7',
    fontSize: 11,
  },
  memoryEntry: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.055)',
  },
  memoryEntryTop: {
    flexDirection: 'row',
    gap: 10,
  },
  memoryMark: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(255,183,3,0.11)',
  },
  memoryEntryCopy: {
    flex: 1,
  },
  memoryEntryText: {
    color: '#E3EAF2',
    fontSize: 13,
    lineHeight: 20,
  },
  memoryWhy: {
    color: '#9BA9BC',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  memoryTime: {
    color: '#77879D',
    fontSize: 10,
    marginTop: 5,
  },
  forgetLink: {
    alignSelf: 'flex-start',
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
    marginLeft: 39,
    marginTop: 3,
  },
  emptyMemory: {
    color: '#8796AA',
    fontSize: 12,
    paddingTop: 12,
  },
  vaultPrivacyFoot: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  vaultFootText: {
    color: '#9CAFC1',
    fontSize: 11,
  },
  onboardingCard: {
    width: '100%',
    maxWidth: 460,
    maxHeight: '91%',
    alignSelf: 'center',
    paddingTop: 22,
    paddingHorizontal: 23,
    paddingBottom: 18,
    borderTopLeftRadius: 29,
    borderTopRightRadius: 29,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.11)',
    backgroundColor: '#111D35',
  },
  onboardingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skipButton: {
    minHeight: 42,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  skipText: {
    color: '#AAB7C9',
    fontSize: 12,
    fontWeight: '600',
  },
  progressRail: {
    height: 4,
    marginTop: 18,
    borderRadius: 4,
    backgroundColor: '#25324C',
    overflow: 'hidden',
  },
  progressFill: {
    height: 4,
    borderRadius: 4,
    backgroundColor: '#48CAE4',
  },
  onboardingScroll: {
    paddingTop: 24,
    paddingBottom: 12,
  },
  onboardingStepText: {
    color: '#6BCBDA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  onboardingTitle: {
    color: '#F2F6FA',
    fontSize: 25,
    fontWeight: '700',
    lineHeight: 32,
  },
  onboardingCopy: {
    color: '#AAB7C9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 9,
    marginBottom: 18,
  },
  onboardingPersona: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    padding: 13,
    marginTop: 9,
    borderWidth: 1,
    borderRadius: 17,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  onboardingPersonaActive: {
    borderColor: 'rgba(72,202,228,0.43)',
    backgroundColor: 'rgba(72,202,228,0.075)',
  },
  onboardingPersonaIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  onboardingPersonaTitle: {
    color: '#E8EFF6',
    fontSize: 14,
    fontWeight: '700',
  },
  onboardingPersonaDescription: {
    color: '#95A5BA',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  fieldLabel: {
    color: '#96A6BC',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 7,
  },
  onboardingInput: {
    minHeight: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#34415A',
    backgroundColor: '#18243C',
    color: '#F2F6FA',
    paddingHorizontal: 14,
    fontSize: 15,
  },
  suggestionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 11,
  },
  nameSuggestion: {
    paddingHorizontal: 14,
    minHeight: 38,
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#202C48',
  },
  nameSuggestionActive: {
    backgroundColor: 'rgba(72,202,228,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(72,202,228,0.32)',
  },
  nameSuggestionText: {
    color: '#AAB7C9',
    fontSize: 12,
  },
  nameSuggestionTextActive: {
    color: '#A9EBF1',
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  privacyNoteText: {
    color: '#95A5BA',
    fontSize: 11,
  },
  voiceSampleList: {
    gap: 9,
    marginTop: 4,
  },
  voiceSample: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 57,
    gap: 10,
    paddingHorizontal: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(255,255,255,0.035)',
  },
  voiceSampleActive: {
    borderColor: 'rgba(72,202,228,0.36)',
    backgroundColor: 'rgba(72,202,228,0.07)',
  },
  sampleIcon: {
    width: 31,
    height: 31,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  voiceSampleText: {
    flex: 1,
    color: '#E2EAF2',
    fontSize: 13,
    fontWeight: '600',
  },
  sampleBars: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  sampleBar: {
    width: 3,
    borderRadius: 3,
    backgroundColor: '#48CAE4',
  },
  voicePreviewNotice: {
    color: '#8D9DB2',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 13,
  },
  onboardingFooter: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
  },
  backButton: {
    width: 48,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    backgroundColor: '#202C48',
  },
  continueButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: '#48CAE4',
  },
  continueText: {
    color: '#0B132B',
    fontSize: 14,
    fontWeight: '700',
  },
  sosBackdrop: {
    flex: 1,
    backgroundColor: '#0B132B',
    justifyContent: 'center',
    paddingHorizontal: 19,
  },
  sosPanel: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '96%',
    alignSelf: 'center',
  },
  sosModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sosShield: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,183,3,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,183,3,0.22)',
  },
  sosTitle: {
    color: '#F4F5F6',
    fontSize: 27,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sosDescription: {
    color: '#AAB7C9',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 17,
  },
  sosContactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  sosContactIcon: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255,183,3,0.1)',
  },
  sosCardLabel: {
    color: '#8C9CB1',
    fontSize: 9,
    letterSpacing: 1.1,
    fontWeight: '700',
  },
  sosCardValue: {
    color: '#E4EAF1',
    fontSize: 13,
    marginTop: 4,
    fontWeight: '600',
  },
  mapPreview: {
    height: 150,
    overflow: 'hidden',
    borderRadius: 17,
    marginTop: 12,
    backgroundColor: '#182A3D',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
  },
  mapGridLineHorizontal: {
    position: 'absolute',
    left: -20,
    right: -20,
    top: 62,
    height: 2,
    transform: [{ rotate: '-11deg' }],
    backgroundColor: 'rgba(100,221,170,0.15)',
  },
  mapGridLineVertical: {
    position: 'absolute',
    top: -25,
    bottom: -25,
    left: '57%',
    width: 2,
    transform: [{ rotate: '21deg' }],
    backgroundColor: 'rgba(72,202,228,0.14)',
  },
  mapRoadOne: {
    position: 'absolute',
    left: 10,
    right: 10,
    top: 87,
    height: 14,
    borderRadius: 14,
    transform: [{ rotate: '16deg' }],
    backgroundColor: 'rgba(255,255,255,0.045)',
  },
  mapRoadTwo: {
    position: 'absolute',
    width: 200,
    top: 20,
    bottom: 12,
    left: '30%',
    borderRadius: 20,
    transform: [{ rotate: '-28deg' }],
    borderWidth: 8,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  mapPin: {
    position: 'absolute',
    alignSelf: 'center',
    top: 45,
    width: 38,
    height: 38,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(230,57,70,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(230,57,70,0.35)',
  },
  mapLabel: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(8,16,31,0.84)',
  },
  mapLabelText: {
    color: '#BDCAD7',
    fontSize: 10,
  },
  mapShareBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    color: '#F2D38C',
    fontSize: 9,
    fontWeight: '600',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'rgba(8,16,31,0.84)',
  },
  sirenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 60,
    marginTop: 12,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  sirenIcon: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: 'rgba(255,183,3,0.1)',
  },
  sirenTitle: {
    color: '#E8EDF3',
    fontSize: 12,
    fontWeight: '600',
  },
  sirenCaption: {
    color: '#8E9DB1',
    fontSize: 10,
    marginTop: 3,
  },
  sosActions: {
    marginTop: 15,
  },
  startSosButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 15,
    backgroundColor: '#C93343',
  },
  startSosText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  cancelSosButton: {
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  cancelSosText: {
    color: '#F0F4F8',
    fontSize: 14,
    fontWeight: '700',
  },
  sosDisclaimer: {
    color: '#96A4B7',
    fontSize: 10,
    lineHeight: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  sosCompleteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
  },
  sosCompleteText: {
    color: '#9EE4C5',
    fontSize: 11,
  },
});
