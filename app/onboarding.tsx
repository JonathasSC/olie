import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ProfileRepository } from '../services/db/profile-repository';

export default function OnboardingScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const canContinue = firstName.trim().length > 0;

  function handleContinue() {
    if (!canContinue) return;
    ProfileRepository.save({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    });
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brand}>
            <Image
              source={require('../assets/images/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>olie</Text>
            <Text style={styles.tagline}>seu assistente pessoal</Text>
          </View>

          <View style={styles.welcome}>
            <Text style={styles.welcomeTitle}>Bem-vindo!</Text>
            <Text style={styles.welcomeSubtitle}>
              Antes de começar, nos conta um pouco sobre você.
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.fieldLabel}>PRIMEIRO NOME *</Text>
            <TextInput
              style={styles.input}
              placeholder="Como devemos te chamar?"
              placeholderTextColor="#bbb"
              value={firstName}
              onChangeText={setFirstName}
              autoFocus
              returnKeyType="next"
              onSubmitEditing={() => lastNameRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.fieldLabel}>SOBRENOME</Text>
            <TextInput
              ref={lastNameRef}
              style={styles.input}
              placeholder="Opcional"
              placeholderTextColor="#bbb"
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              blurOnSubmit={false}
            />

            <Text style={styles.fieldLabel}>E-MAIL</Text>
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder="Opcional"
              placeholderTextColor="#bbb"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, !canContinue && styles.buttonDisabled]}
            onPress={handleContinue}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Começar</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 24,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 72,
    height: 72,
    marginBottom: 12,
    borderRadius: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#8a8a8a',
    marginTop: 4,
  },
  welcome: {
    marginBottom: 32,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8a8a8a',
    lineHeight: 20,
  },
  form: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    color: '#8a8a8a',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: '#000',
  },
  footer: {
    paddingHorizontal: 28,
    paddingTop: 12,
    paddingBottom: 48,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: '#d0d0d0',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
