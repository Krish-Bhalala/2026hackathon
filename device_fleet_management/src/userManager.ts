export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export class UserManager {
  private users: Map<string, User> = new Map();

  addUser(user: User): void {
    if (!user.id) {
      throw new Error('User must have an id');
    }
    if (this.users.has(user.id)) {
      throw new Error(`User with id ${user.id} already exists`);
    }
    this.users.set(user.id, user);
  }

  removeUser(id: string): void {
    if (!this.users.has(id)) {
      throw new Error(`User with id ${id} not found`);
    }
    this.users.delete(id);
  }

  getUser(id: string): User | null {
    return this.users.get(id) ?? null;
  }

  getUsersByEmail(email: string): User[] {
    return Array.from(this.users.values()).filter(u => u.email === email);
  }

  getUsersByPhone(phone: string): User[] {
    return Array.from(this.users.values()).filter(u => u.phone === phone);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getUserCount(): number {
    return this.users.size;
  }
}