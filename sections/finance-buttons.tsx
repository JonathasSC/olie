import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function FinanceButtonsSection() {
    return (
        <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.actionGrid}
        >
            <TouchableOpacity style={styles.actionButton}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name='trending-down' size={16}/>
                </View>
                <Text style={styles.actionButtonTitle}>Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name='trending-up' size={16} />
                </View>
                <Text style={styles.actionButtonTitle}>Ganho</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
                <View style={styles.iconContainer}>
                    <Ionicons style={styles.icon} name='stats-chart' size={16}/>
                </View>
                <Text style={styles.actionButtonTitle}>Investimento</Text>
            </TouchableOpacity>    
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    actionGrid: {
        gap: 12,
        flexDirection: 'row',
    },
    actionButton: {
        width: 120,
        gap: 10,
        padding: 16,
        borderRadius: 8,
        backgroundColor: '#000',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 24,
        height: 24,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonTitle: {
        color: '#fafafa',
        fontWeight: '500',
        fontSize: 13
    },
    icon: {
        color: '#fafafa'
    }
})