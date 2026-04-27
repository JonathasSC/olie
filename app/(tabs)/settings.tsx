import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { Colors, Radius, Fonts } from '@/constants/design';
import { exportDatabase, importDatabase } from '@/services/db/backup-service';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Ajustes</ThemedText>
          <ThemedText style={styles.subtitle}>Gerencie seus dados e preferências</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Backup e Dados</ThemedText>
          <View style={styles.card}>
            <TouchableOpacity 
              style={styles.item} 
              onPress={exportDatabase}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors.incomeSurf }]}>
                <IconSymbol name="square.and.arrow.up" size={20} color={Colors.income} />
              </View>
              <View style={styles.itemTextContainer}>
                <ThemedText style={styles.itemTitle}>Exportar Dados</ThemedText>
                <ThemedText style={styles.itemDescription}>Salve uma cópia do seu banco de dados</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity 
              style={styles.item} 
              onPress={importDatabase}
              activeOpacity={0.7}
            >
              <View style={[styles.iconContainer, { backgroundColor: Colors.expenseSurf }]}>
                <IconSymbol name="square.and.arrow.down" size={20} color={Colors.expense} />
              </View>
              <View style={styles.itemTextContainer}>
                <ThemedText style={styles.itemTitle}>Importar Dados</ThemedText>
                <ThemedText style={styles.itemDescription}>Restaure dados de um arquivo exportado</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={16} color={Colors.t3} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.versionText}>Olie v1.0.0</ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.display,
    color: Colors.t1,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.body,
    color: Colors.t2,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: Fonts.bodySb,
    color: Colors.t3,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.bdr,
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: Fonts.bodySb,
    color: Colors.t1,
  },
  itemDescription: {
    fontSize: 13,
    fontFamily: Fonts.body,
    color: Colors.t2,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.bdr,
    marginLeft: 72,
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    fontFamily: Fonts.mono,
    color: Colors.t3,
  },
});
