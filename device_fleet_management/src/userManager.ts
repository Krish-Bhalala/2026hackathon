export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export class UserManager {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, User[]> = new Map();
  private phoneIndex: Map<string, User[]> = new Map();

  addUser(user: User): void {
    if (!user.id) throw new Error('User must have an id');
    if (this.users.has(user.id)) throw new Error(`User with id ${user.id} already exists`);

    this.users.set(user.id, user);

    const emailList = this.emailIndex.get(user.email) || [];
    emailList.push(user);
    this.emailIndex.set(user.email, emailList);

    const phoneList = this.phoneIndex.get(user.phone) || [];
    phoneList.push(user);
    this.phoneIndex.set(user.phone, phoneList);
  }

  removeUser(id: string): void {
    const user = this.users.get(id);
    if (!user) throw new Error(`User with id ${id} not found`);

    // Get the list of all users who share the same email(from email index Map).
    const emailList = this.emailIndex.get(user.email);
    if (emailList) {
      // filter out the user we're deleting (keeping only users with different IDs).
      const updated = emailList.filter(u => u.id !== id);
      // delete the entire email entry if no user left with this email
      if (updated.length === 0) {
        this.emailIndex.delete(user.email);
      } else {
        this.emailIndex.set(user.email, updated);
      }
    }

    // getAllUsers with that phone number
    const phoneList = this.phoneIndex.get(user.phone);
    if (phoneList) {
      // filter out the user we're deleting (keep only users with different IDs).
      const updated = phoneList.filter(u => u.id !== id);
      // delete the entire phone entry if no user left with this phone number
      if (updated.length === 0) {
        this.phoneIndex.delete(user.phone);
      } else {
        this.phoneIndex.set(user.phone, updated);
      }
    }

    this.users.delete(id);
  }

  getUser(id: string): User | null {
    return this.users.get(id) ?? null;
  }

  getUsersByEmail(email: string): User[] {
    return this.emailIndex.get(email) || [];
  }

  getUsersByPhone(phone: string): User[] {
    return this.phoneIndex.get(phone) || [];
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }

}