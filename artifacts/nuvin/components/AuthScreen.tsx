import { Ionicons } from '@expo/vector-icons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { useSSO, useSignIn, useSignUp } from '@clerk/expo';
import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { NuvinMark } from '@/components/NuvinMark';
import { useColors } from '@/hooks/useColors';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'signIn' | 'signUp';
type VerificationFlow = 'signIn' | 'signUp' | null;

function getMessage(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return 'We couldn’t complete that request. Please try again.';
}

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    signIn,
    fetchStatus: signInStatus,
    errors: signInErrors,
  } = useSignIn();
  const {
    signUp,
    fetchStatus: signUpStatus,
    errors: signUpErrors,
  } = useSignUp();
  const { startSSOFlow } = useSSO();

  const [mode, setMode] = useState<AuthMode>('signIn');
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow>(null);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [googleBusy, setGoogleBusy] = useState(false);

  const busy =
    googleBusy ||
    signInStatus === 'fetching' ||
    signUpStatus === 'fetching';

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const finalizeSignIn = async () => {
    await signIn.finalize({ navigate: () => undefined });
  };

  const finalizeSignUp = async () => {
    await signUp.finalize({ navigate: () => undefined });
  };

  const submitCredentials = async () => {
    setErrorMessage('');
    if (!emailAddress.trim() || !password) {
      setErrorMessage('Enter your email address and password to continue.');
      return;
    }

    try {
      if (mode === 'signUp') {
        const { error } = await signUp.password({
          emailAddress: emailAddress.trim(),
          password,
        });
        if (error) {
          setErrorMessage(getMessage(error));
          return;
        }

        if (signUp.status === 'complete') {
          await finalizeSignUp();
          return;
        }

        const verification = await signUp.verifications.sendEmailCode();
        if (verification?.error) {
          setErrorMessage(getMessage(verification.error));
          return;
        }
        setVerificationFlow('signUp');
        return;
      }

      const { error } = await signIn.password({
        emailAddress: emailAddress.trim(),
        password,
      });
      if (error) {
        setErrorMessage(getMessage(error));
        return;
      }

      if (signIn.status === 'complete') {
        await finalizeSignIn();
        return;
      }

      if (
        signIn.status === 'needs_client_trust' ||
        signIn.status === 'needs_second_factor'
      ) {
        const emailCodeFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === 'email_code',
        );
        if (emailCodeFactor) {
          const verification = await signIn.mfa.sendEmailCode();
          if (verification?.error) {
            setErrorMessage(getMessage(verification.error));
            return;
          }
          setVerificationFlow('signIn');
        } else {
          setErrorMessage(
            'This account needs another verification method. Try Google sign-in or contact support.',
          );
        }
        return;
      }

      setErrorMessage('Sign-in is not complete yet. Please try again.');
    } catch (error) {
      setErrorMessage(getMessage(error));
    }
  };

  const verifyCode = async () => {
    setErrorMessage('');
    if (!code.trim()) {
      setErrorMessage('Enter the verification code from your email.');
      return;
    }

    try {
      if (verificationFlow === 'signUp') {
        await signUp.verifications.verifyEmailCode({ code: code.trim() });
        if (signUp.status === 'complete') {
          await finalizeSignUp();
        } else {
          setErrorMessage(
            signUpErrors.fields.code?.message ??
              'That code could not be verified. Check it and try again.',
          );
        }
        return;
      }

      if (verificationFlow === 'signIn') {
        await signIn.mfa.verifyEmailCode({ code: code.trim() });
        if (signIn.status === 'complete') {
          await finalizeSignIn();
        } else {
          setErrorMessage(
            signInErrors.fields.code?.message ??
              'That code could not be verified. Check it and try again.',
          );
        }
      }
    } catch (error) {
      setErrorMessage(getMessage(error));
    }
  };

  const signInWithGoogle = async () => {
    setErrorMessage('');
    setGoogleBusy(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({ scheme: 'nuvin' }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
      } else {
        setErrorMessage(
          'Google sign-in needs another verification step. Continue with email and password for now.',
        );
      }
    } catch (error) {
      setErrorMessage(getMessage(error));
    } finally {
      setGoogleBusy(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setVerificationFlow(null);
    setCode('');
    setErrorMessage('');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAwareScrollViewCompat
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, Platform.OS === 'web' ? 67 : 24),
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'web' ? 34 : 24),
          },
        ]}
        bottomOffset={24}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brandRow}>
          <NuvinMark size={46} />
          <View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>nuvin</Text>
            <Text style={[styles.brandCaption, { color: colors.mutedForeground }]}>
              A little more support, on your terms.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {verificationFlow ? 'EMAIL VERIFICATION' : 'YOUR PRIVATE SPACE'}
          </Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {verificationFlow
              ? 'Check your inbox'
              : mode === 'signIn'
                ? 'Welcome back'
                : 'Create your account'}
          </Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>
            {verificationFlow
              ? `We sent a one-time code to ${emailAddress.trim()}.`
              : mode === 'signIn'
                ? 'Sign in to continue with your companion.'
                : 'Set up an account to return to Nuvin on this device.'}
          </Text>

          {!verificationFlow ? (
            <>
              <View
                style={[
                  styles.modePicker,
                  { backgroundColor: colors.background, borderColor: colors.border },
                ]}
              >
                {([
                  ['signIn', 'Sign in'],
                  ['signUp', 'Create account'],
                ] as const).map(([nextMode, label]) => {
                  const selected = mode === nextMode;
                  return (
                    <Pressable
                      key={nextMode}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() => switchMode(nextMode)}
                      style={[
                        styles.modeButton,
                        selected && { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeButtonText,
                          { color: selected ? colors.primaryForeground : colors.mutedForeground },
                        ]}
                      >
                        {label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                disabled={busy}
                onPress={() => void signInWithGoogle()}
                style={[
                  styles.googleButton,
                  { borderColor: colors.border, backgroundColor: colors.background },
                  busy && styles.disabled,
                ]}
              >
                <Ionicons name="logo-google" size={18} color={colors.foreground} />
                <Text style={[styles.googleText, { color: colors.foreground }]}>
                  Continue with Google
                </Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>
                  or with email
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              </View>

              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Email address
              </Text>
              <TextInput
                accessibilityLabel="Email address"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                value={emailAddress}
                onChangeText={setEmailAddress}
                placeholder="you@example.com"
                placeholderTextColor={colors.mutedForeground}
                editable={!busy}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />

              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoComplete={mode === 'signUp' ? 'new-password' : 'current-password'}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedForeground}
                secureTextEntry
                editable={!busy}
                onSubmitEditing={() => void submitCredentials()}
                returnKeyType="go"
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
            </>
          ) : (
            <>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>
                Verification code
              </Text>
              <TextInput
                accessibilityLabel="Email verification code"
                autoComplete="one-time-code"
                keyboardType="number-pad"
                value={code}
                onChangeText={setCode}
                placeholder="Enter code"
                placeholderTextColor={colors.mutedForeground}
                editable={!busy}
                style={[
                  styles.input,
                  {
                    color: colors.foreground,
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  },
                ]}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setVerificationFlow(null);
                  setCode('');
                  setErrorMessage('');
                }}
                style={styles.backLink}
              >
                <Text style={[styles.linkText, { color: colors.primary }]}>
                  Use a different email
                </Text>
              </Pressable>
            </>
          )}

          {errorMessage ? (
            <Text
              accessibilityLiveRegion="polite"
              style={[styles.errorText, { color: colors.destructive }]}
            >
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={busy}
            onPress={() =>
              void (verificationFlow ? verifyCode() : submitCredentials())
            }
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary },
              busy && styles.disabled,
            ]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.primaryForeground }]}>
              {busy
                ? 'Please wait…'
                : verificationFlow
                  ? 'Verify email'
                  : mode === 'signIn'
                    ? 'Sign in'
                    : 'Create account'}
            </Text>
            {!busy ? (
              <Ionicons
                name={verificationFlow ? 'checkmark' : 'arrow-forward'}
                size={18}
                color={colors.primaryForeground}
              />
            ) : null}
          </Pressable>

          <Text style={[styles.privacyNote, { color: colors.mutedForeground }]}>
            Your memories and personal setup stay on this device.
          </Text>
          <View nativeID="clerk-captcha" />
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  brandRow: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    marginBottom: 25,
  },
  brandName: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  brandCaption: { fontSize: 13, marginTop: 2 },
  card: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 26,
    padding: 22,
  },
  eyebrow: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4 },
  title: { fontSize: 27, lineHeight: 34, fontWeight: '700', marginTop: 7 },
  description: { fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 19 },
  modePicker: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  modeButton: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  modeButtonText: { fontSize: 13, fontWeight: '600' },
  googleButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  googleText: { fontSize: 14, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 17 },
  divider: { flex: 1, height: 1 },
  dividerText: { fontSize: 11 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 7 },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 15,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  primaryButtonText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.55 },
  errorText: { fontSize: 13, lineHeight: 19, marginBottom: 9 },
  privacyNote: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 15 },
  backLink: { alignSelf: 'flex-start', paddingVertical: 8 },
  linkText: { fontSize: 13, fontWeight: '600' },
});
