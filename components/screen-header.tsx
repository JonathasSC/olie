import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
    title: string;
    rightAction?: ReactNode;
};

export default function ScreenHeader({ title, rightAction }: Props) {
    const router = useRouter();

    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="chevron-back" size={22} color="#fff" />
            </TouchableOpacity>

            <Text style={styles.title} numberOfLines={1}>{title}</Text>

            <View style={styles.rightSlot}>
                {rightAction ?? null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: '#000',
        paddingHorizontal: 8,
        paddingTop: 56,
        paddingBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        minWidth: 80,
        paddingHorizontal: 4,
    },
    backText: {
        color: '#fff',
        fontSize: 17,
    },
    title: {
        flex: 1,
        textAlign: 'center',
        color: '#fff',
        fontSize: 17,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    rightSlot: {
        minWidth: 80,
        alignItems: 'flex-end',
        paddingHorizontal: 4,
    },
});
