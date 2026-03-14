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

  // constructor, gets called when a new instance of the class is created
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
    if (this.versionIndex.has(device.version)) {
      this.versionIndex.get(device.version)!.push(device);
    } else {
      this.versionIndex.set(device.version, [device]);
    }
    if (this.userIndex.has(device.user_id)) {
      this.userIndex.get(device.user_id)!.push(device);
    } else {
      this.userIndex.set(device.user_id, [device]);
    }
    if (this.statusIndex.has(device.status)) {
      this.statusIndex.get(device.status)!.push(device);
    } else {
      this.statusIndex.set(device.status, [device]);
    }
  }

  removeDevice(id: string): void {
    const device = this.devices.get(id);
    if (!device) throw new Error(`Device with id ${id} not found`);
    this.devices.delete(id);
    this.versionIndex.get(device.version)!.splice(this.versionIndex.get(device.version)!.indexOf(device), 1);
    this.userIndex.get(device.user_id)!.splice(this.userIndex.get(device.user_id)!.indexOf(device), 1);
    this.statusIndex.get(device.status)!.splice(this.statusIndex.get(device.status)!.indexOf(device), 1);
  }

  getDevice(id: string): Device | null {
    return this.devices.get(id) ?? null;
  }

  getDevicesByVersion(version: string): Device[] | null {
    return this.versionIndex.get(version) ?? [];
  }

  getDevicesByUserId(user_id: string): Device[] | null {
    return this.userIndex.get(user_id) ?? [];
  }

  getDevicesByStatus(status: 'active' | 'inactive' | 'pending' | 'failed'): Device[] | null {
    return this.statusIndex.get(status) ?? [];
  }

  getDevicesInArea(latitude: number, longitude: number, radius_km: number): Device[] | null {
    // returns all devices within a radius of the given latitude and longitude
    // the radius is in kilometers
    return null;
  }

  getDevicesNearDevice(device_id: string, radius_km: number): Device[] | null {
    // returns all devices within a radius of the given device (not including the device itself)
    // the radius is in kilometers
    return null;
  }

  getAllDevices(): Device[] {
    return Array.from(this.devices.values());
  }

  getDeviceCount(): number {
    return this.devices.size;
  }

  // private validators
  //   addDevice(device)	Add a new device. Should throw if id is empty or already exists.
  // removeDevice(id)	Remove a device by ID. Should throw if device doesn't exist.
  // getDevice(id)	Return device by ID, or null if not found.
  // getDevicesByVersion(version)	Return all devices with matching firmware version.
  // getDevicesByUserId(user_id)	Return all devices owned by a user.
  // getDevicesByStatus(status)	Return all devices with matching status.
  // getDevicesInArea(lat, lng, radius_km)	Return all devices within radius_km kilometers of the coordinates.
  // getDevicesNearDevice(device_id, radius_km)	Return all devices within radius_km of another device (excluding that device). Returns null if device_id not found.
  // getAllDevices()	Return all devices.
  // getDeviceCount()	Return total number of devices.
  private validateDevice(device: Device): void {
    if (!device.id) throw new Error('Device must have an id');
  }
}
