// ...existing code...
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function PrimaryButton({ text, onPress }: { text: string; onPress: () => void }) {
    return (
        <TouchableOpacity onPress={onPress} style={styles.button}>
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#1F41BB',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 16,
    },
    text: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});
// ...existing code...