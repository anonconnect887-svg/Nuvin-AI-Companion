import { useAuth } from '@clerk/expo';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import AuthScreen from '@/components/AuthScreen';
import NuvinHome from '@/components/NuvinHome';
import { useColors } from '@/hooks/useColors';

export default function HomeRoute() {
  const colors = useColors();
  const { isLoaded, isSignedIn, getToken } = useAuth();

  useEffect(() => {
    setAuthTokenGetter(() => (isSignedIn ? getToken() : Promise.resolve(null)));
  }, [getToken, isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return isSignedIn ? <NuvinHome /> : <AuthScreen />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
