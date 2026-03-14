import { DeviceManager, Device } from './deviceManager';
import { UserManager, User } from './userManager';

export class FleetManager {
    deviceManager: DeviceManager;
    userManager: UserManager;

    constructor(deviceManager: DeviceManager, userManager: UserManager) {
        this.deviceManager = deviceManager;
        this.userManager = userManager;
    }

    addUser(user: User): void {
        return this.userManager.addUser(user);
    }

    removeUser(id: string): void {
        //when we remove a user, we need to make sure all devices associated with the user are also removed
        this.userManager.removeUser(id);
        const devices = this.deviceManager.getDevicesByUserId(id);
        devices.map(device => this.deviceManager.removeDevice(device.id));
    }

    getUser(id: string): User | null {
        return this.userManager.getUser(id) ?? null;
    }

    addDevice(device: Device): void {
        //Add a device, but only if its user_id references a valid user. Throw an error if the user doesn't exist.
        if (!this.userManager.getUser(device.user_id)) throw new Error(`Cannot add device: User with id ${device.user_id} not found`);
        this.deviceManager.addDevice(device);
    }

    removeDevice(id: string): void {
        return this.deviceManager.removeDevice(id);
    }

    getDevice(id: string): Device | null {
        return this.deviceManager.getDevice(id) ?? null;
    }

    getUserDevices(userId: string): Device[] {
        return this.deviceManager.getDevicesByUserId(userId) ?? [];
    }

    getUserCount(): number {
        return this.userManager.getUserCount();
    }

    getDeviceCount(): number {
        return this.deviceManager.getDeviceCount();
    }
}

export { DeviceManager, Device } from './deviceManager';
export { UserManager, User } from './userManager';
