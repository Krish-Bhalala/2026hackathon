export interface Device {
  id: string;
  name: string;
  version: string;
  user_id: string;
  status: 'active' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
  };
}

export class DeviceManager {
  private devices: Map<string, Device>;
  private versionIndex: Map<string, Device[]>;
  private userIndex: Map<string, Device[]>;
  private statusIndex: Map<string, Device[]>;

  constructor() {
    this.devices = new Map<string, Device>();
    this.versionIndex = new Map<string, Device[]>();
    this.userIndex = new Map<string, Device[]>();
    this.statusIndex = new Map<string, Device[]>();
  }

  addDevice(device: Device): void {
    this.validateDevice(device);
    if (this.devices.has(device.id)) throw new Error(`Device with id ${device.id} already exists`);
    this.devices.set(device.id, device);

    const versionList = this.versionIndex.get(device.version) || [];
    versionList.push(device);
    this.versionIndex.set(device.version, versionList);

    const userList = this.userIndex.get(device.user_id) || [];
    userList.push(device);
    this.userIndex.set(device.user_id, userList);

    const statusList = this.statusIndex.get(device.status) || [];
    statusList.push(device);
    this.statusIndex.set(device.status, statusList);
  }

  removeDevice(id: string): void {
    const device = this.devices.get(id);
    if (!device) throw new Error(`Device with id ${id} not found`);
    this.devices.delete(id);

    const versionList = this.versionIndex.get(device.version);
    if (versionList) {
      const updated = versionList.filter(d => d.id !== id);
      updated.length === 0 ? this.versionIndex.delete(device.version) : this.versionIndex.set(device.version, updated);
    }

    const userList = this.userIndex.get(device.user_id);
    if (userList) {
      const updated = userList.filter(d => d.id !== id);
      updated.length === 0 ? this.userIndex.delete(device.user_id) : this.userIndex.set(device.user_id, updated);
    }

    const statusList = this.statusIndex.get(device.status);
    if (statusList) {
      const updated = statusList.filter(d => d.id !== id);
      updated.length === 0 ? this.statusIndex.delete(device.status) : this.statusIndex.set(device.status, updated);
    }
  }

  getDevice(id: string): Device | null {
    return this.devices.get(id) ?? null;
  }

  getDevicesByVersion(version: string): Device[] {
    return this.versionIndex.get(version) ?? [];
  }

  getDevicesByUserId(user_id: string): Device[] {
    return this.userIndex.get(user_id) ?? [];
  }

  getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] {
    return this.statusIndex.get(status) ?? [];
  }

  getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] {
    const center = { latitude, longitude };
    return Array.from(this.devices.values()).filter(device =>
      this.haversineDistance(center, device.location) <= radius_km
    );
  }

  getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
    const device = this.devices.get(device_id);
    if (!device) return null;

    return Array.from(this.devices.values()).filter(d =>
      d.id !== device_id && this.haversineDistance(device.location, d.location) <= radius_km
    );
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getDeviceCount(): number {
    return this.devices.size;
  }

  private validateDevice(device: Device): void {
    if (!device.id) throw new Error('Device must have an id');
  }

  haversineDistance(loc1: { latitude: number; longitude: number }, loc2: { latitude: number; longitude: number }): number {
    const R = 6371;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(loc2.latitude - loc1.latitude);
    const dLng = toRad(loc2.longitude - loc1.longitude);
    const lat1 = toRad(loc1.latitude);
    const lat2 = toRad(loc2.latitude);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}