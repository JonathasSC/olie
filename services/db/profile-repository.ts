import { getDatabase } from './database';

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

export const ProfileRepository = {
  get(): Profile {
    const db = getDatabase();
    const row = db.getFirstSync<{ first_name: string; last_name: string; email: string }>(
      'SELECT first_name, last_name, email FROM profile WHERE id = 1'
    );
    return {
      firstName: row?.first_name ?? '',
      lastName: row?.last_name ?? '',
      email: row?.email ?? '',
    };
  },

  save(profile: Profile): void {
    const db = getDatabase();
    db.runSync(
      'UPDATE profile SET first_name = ?, last_name = ?, email = ? WHERE id = 1',
      profile.firstName,
      profile.lastName,
      profile.email
    );
  },
};
