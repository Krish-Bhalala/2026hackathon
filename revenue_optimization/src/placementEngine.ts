export interface Ad {
    adId: string;
    advertiserId: string;
    timeReceived: number;
    timeout: number;
    duration: number;
    baseRevenue: number;
    bannedLocations: string[];
}

export interface Area {
    areaId: string;
    location: string;
    multiplier: number;
    totalScreens: number;
    timeWindow: number;
}

export interface ScheduledAd {
    adId: string;
    areaId: string;
    startTime: number;
    endTime: number;
}

export type Schedule = Record<string, ScheduledAd[]>;

export class PlacementEngine {

    constructor() {
    }

    isAdCompatibleWithArea(ad: Ad, area: Area): boolean {
        return !ad.bannedLocations.includes(area.location);
    }

    getTotalScheduledTimeForArea(areaSchedule: ScheduledAd[]): number {
        return areaSchedule.reduce((total, scheduledAd) => total + (scheduledAd.endTime - scheduledAd.startTime), 0);
    }

    doesPlacementFitTimingConstraints(
        ad: Ad,
        area: Area,
        startTime: number
    ): boolean {
        if (startTime < 0) return false;
        // Must start within the ad's availability window [timeReceived, timeReceived + timeout]
        if (startTime < ad.timeReceived || startTime > ad.timeReceived + ad.timeout) return false;
        // Ad must finish before the area's time window ends
        if (startTime + ad.duration > area.timeWindow) return false;
        return true;
    }

    isAdAlreadyScheduled(adId: string, schedule: Schedule): boolean {
        for (const areaId in schedule) {
            if (schedule[areaId].some(sa => sa.adId === adId)) return true;
        }
        return false;
    }

    canScheduleAd(
        ad: Ad,
        area: Area,
        schedule: Schedule,
        startTime: number
    ): boolean {
        if (!this.isAdCompatibleWithArea(ad, area)) return false;
        if (this.isAdAlreadyScheduled(ad.adId, schedule)) return false;
        if (!this.doesPlacementFitTimingConstraints(ad, area, startTime)) return false;

        // Check for overlaps with existing ads in this area
        const areaSchedule = schedule[area.areaId] || [];
        const newStart = startTime;
        const newEnd = startTime + ad.duration;

        for (const existing of areaSchedule) {
            if (newStart < existing.endTime && newEnd > existing.startTime) return false;
        }

        return true;
    }

    //Return true if the area schedule is valid: no overlaps, all ads exist in the ads list, all ads are allowed in this location, and all ads fit within the area's time window.
    isAreaScheduleValid(area: Area, areaSchedule: ScheduledAd[], ads: Ad[]): boolean {
        return true;
    }
}