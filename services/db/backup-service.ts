import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { closeDatabase } from './database';

const DB_NAME = 'olie.db';
const DB_PATH = `${FileSystem.documentDirectory}SQLite/${DB_NAME}`;

export const exportDatabase = async () => {
  try {
    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Erro', 'O compartilhamento não está disponível no seu dispositivo.');
      return;
    }

    const fileInfo = await FileSystem.getInfoAsync(DB_PATH);
    if (!fileInfo.exists) {
      Alert.alert('Erro', 'Banco de dados não encontrado.');
      return;
    }

    const tmpPath = `${FileSystem.cacheDirectory}${DB_NAME}`;

    await FileSystem.copyAsync({
      from: DB_PATH,
      to: tmpPath,
    });

    await Sharing.shareAsync(tmpPath, {
      mimeType: 'application/x-sqlite3',
      dialogTitle: 'Exportar Banco de Dados',
      UTI: 'public.database',
    });
  } catch (error) {
    console.error('Export failed:', error);
    Alert.alert('Erro', 'Falha ao exportar o banco de dados.');
  }
};

export const importDatabase = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) return;

    const pickedFile = result.assets[0];

    Alert.alert(
      'Importar Banco de Dados',
      'Isso substituirá todos os seus dados atuais. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Importar',
          style: 'destructive',
          onPress: async () => {
            try {
              closeDatabase();

              const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;

              const dirInfo = await FileSystem.getInfoAsync(sqliteDir);
              if (!dirInfo.exists) {
                await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
              }

              await FileSystem.copyAsync({
                from: pickedFile.uri,
                to: DB_PATH,
              });

              Alert.alert(
                'Sucesso',
                'Banco de dados importado com sucesso. Reinicie o aplicativo para garantir que as alterações sejam aplicadas.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              console.error('Import failed during file copy:', error);
              Alert.alert('Erro', 'Falha ao importar o arquivo.');
            }
          },
        },
      ]
    );
  } catch (error) {
    console.error('Import failed:', error);
    Alert.alert('Erro', 'Falha ao importar o banco de dados.');
  }
};