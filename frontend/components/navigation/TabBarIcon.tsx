import { StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export function TabBarIcon({ style, ...props }: any) {
  return <Ionicons size={28} style={[styles.icon, style]} {...props} />;
}

const styles = StyleSheet.create({
    icon: {
        marginBottom: -3,
    }
});
