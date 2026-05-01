import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import ScreenHeader from '../components/screen-header';
import { ThemedText } from '../components/themed-text';
import { Colors, Fonts } from '../constants/design';
import { exportDatabase, importDatabase } from '../services/db/backup-service';
import { Profile, ProfileRepository } from '../services/db/profile-repository';

export default function SettingsScreen() {
  const [profile, setProfile] = useState<Profile>({ firstName: '', lastName: '', email: '' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setProfile(ProfileRepository.get());
  }, []);

  function handleSave() {
    ProfileRepository.save(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Ajustes" />

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Perfil</Text>
          <View style={styles.card}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Primeiro nome</Text>
              <TextInput
                style={styles.input}
                value={profile.firstName}
                onChangeText={(v) => setProfile((p) => ({ ...p, firstName: v }))}
                placeholder="Seu primeiro nome"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Último nome</Text>
              <TextInput
                style={styles.input}
                value={profile.lastName}
                onChangeText={(v) => setProfile((p) => ({ ...p, lastName: v }))}
                placeholder="Seu último nome"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.separator} />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>E-mail</Text>
              <TextInput
                style={styles.input}
                value={profile.email}
                onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))}
                placeholder="seu@email.com"
                placeholderTextColor="#aaa"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>{saved ? 'Salvo!' : 'Salvar perfil'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Backup</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.item}
              onPress={exportDatabase}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="arrow-up" size={20} color="#000" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Exportar Dados</Text>
                  <Text style={styles.itemDescription}>Salve uma cópia do seu banco de dados</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-sharp" size={16} color={Colors.t3} />
            </TouchableOpacity>

            <View style={styles.separator} />

            <TouchableOpacity
              style={styles.item}
              onPress={importDatabase}
              activeOpacity={0.7}
            >
              <View style={styles.itemLeft}>
                <View style={styles.iconContainer}>
                  <Ionicons name="arrow-down" size={20} color="#000" />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={styles.itemTitle}>Importar Dados</Text>
                  <Text style={styles.itemDescription}>Restaure dados de um arquivo exportado</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-sharp" size={16} color={Colors.t3} />
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
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    paddingVertical: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  fieldGroup: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#8a8a8a',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
    color: '#000',
    paddingVertical: 2,
  },
  saveButton: {
    marginTop: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  itemTextContainer: {
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontWeight: '600',
    fontSize: 14,
  },
  itemDescription: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 1,
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
