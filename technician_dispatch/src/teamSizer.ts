/**
 * CHALLENGE 3: Minimum Technicians — Fix All Boxes Within a Deadline
 *
 * All boxes must be repaired within deadlineMinutes. All technicians start
 * from the SAME location. Each box is assigned to exactly one technician
 * (no overlapping). Your goal: find the MINIMUM number of technicians needed
 * so that every technician finishes all their assigned boxes on time.
 *
 * Do NOT modify any interface or the pre-implemented helper methods.
 * Implement every method marked with TODO.
 */

export interface Location {
    latitude: number;
    longitude: number;
}

export interface Box {
    id: string;
    name: string;
    location: Location;
    /** Minutes needed to fully repair this box. */
    fixTimeMinutes: number;
}

export interface TechnicianAssignment {
    /** Label for this technician, e.g. "Technician 1", "Technician 2", … */
    technicianLabel: string;
    /** Ordered list of box IDs this technician will visit and fix. */
    assignedBoxIds: string[];
    /** Total time used (travel + fix). Must be ≤ deadlineMinutes. */
    totalTimeMinutes: number;
}

export interface TeamSizeResult {
    /** Minimum number of technicians needed. Equals assignments.length. */
    techniciansNeeded: number;
    /** One entry per technician. No box ID appears in more than one entry. */
    assignments: TechnicianAssignment[];
    /** True when all boxes are assigned and every technician finishes on time. */
    feasible: boolean;
}

export class TeamSizer {

    // ── Pre-implemented helpers — do not modify ───────────────────────────────

    /**
     * Returns the great-circle distance in kilometres between two GPS
     * coordinates using the Haversine formula (Earth radius = 6 371 km).
     */
    haversineDistance(loc1: Location, loc2: Location): number {
        const R = 6371;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        const dLat = toRad(loc2.latitude  - loc1.latitude);
        const dLng = toRad(loc2.longitude - loc1.longitude);
        const lat1 = toRad(loc1.latitude);
        const lat2 = toRad(loc2.latitude);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    /**
     * Returns the travel time in minutes between two locations at a given speed.
     *   travelTimeMinutes = (distanceKm / speedKmh) × 60
     */
    travelTimeMinutes(loc1: Location, loc2: Location, speedKmh: number): number {
        return (this.haversineDistance(loc1, loc2) / speedKmh) * 60;
    }

    // ── Your implementation below ─────────────────────────────────────────────

    calculateAssignmentDuration(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        routeIds: string[]
    ): number | null {
        let totalTimeInMinutes = 0;

        const boxMap = new Map<string, Box>();
        for (const box of boxes) boxMap.set(box.id, box);

        let prevLocation = startLocation;
        for (const routeId of routeIds) {
            const box = boxMap.get(routeId);
            if (!box) return null;

            totalTimeInMinutes += this.travelTimeMinutes(prevLocation, box.location, speedKmh);
            totalTimeInMinutes += box.fixTimeMinutes;
            prevLocation = box.location;
        }

        return totalTimeInMinutes;
    }

    getClosestTechnician(
        location: Location,
        technicianLocations: Location[]
    ): number {
        let bestIndex = 0;
        let bestDistance = Infinity;

        for (let i = 0; i < technicianLocations.length; i++) {
            const dist = this.haversineDistance(technicianLocations[i], location);
            if (dist < bestDistance) {
                bestDistance = dist;
                bestIndex = i;
            }
        }

        return bestIndex;
    }

    tryAssign(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        numTechnicians: number,
        deadlineMinutes: number
    ): TechnicianAssignment[] | null {
        if (boxes.length === 0) {
            return Array.from({ length: numTechnicians }, (_, i) => ({
                technicianLabel: `Technician ${i + 1}`,
                assignedBoxIds: [],
                totalTimeMinutes: 0,
            }));
        }

        for (const box of boxes) {
            const solo =
                this.travelTimeMinutes(startLocation, box.location, speedKmh) +
                box.fixTimeMinutes;
            if (solo > deadlineMinutes) return null;
        }

        // Sort boxes farthest-first from start (furthest-fit decreasing)
        const sortedBoxes = [...boxes].sort((a, b) => {
            const distA = this.haversineDistance(startLocation, a.location);
            const distB = this.haversineDistance(startLocation, b.location);
            return distB - distA;
        });

        const assignments: TechnicianAssignment[] = Array.from(
            { length: numTechnicians },
            (_, i) => ({
                technicianLabel: `Technician ${i + 1}`,
                assignedBoxIds: [],
                totalTimeMinutes: 0,
            })
        );
        const techLocations: Location[] = Array.from(
            { length: numTechnicians },
            () => ({ ...startLocation })
        );

        for (const box of sortedBoxes) {
            const nearestIdx = this.getClosestTechnician(
                box.location,
                techLocations
            );

            const travelNearest = this.travelTimeMinutes(
                techLocations[nearestIdx],
                box.location,
                speedKmh
            );
            const costNearest =
                assignments[nearestIdx].totalTimeMinutes +
                travelNearest +
                box.fixTimeMinutes;

            if (costNearest <= deadlineMinutes) {
                assignments[nearestIdx].assignedBoxIds.push(box.id);
                assignments[nearestIdx].totalTimeMinutes = costNearest;
                techLocations[nearestIdx] = box.location;
                continue;
            }

            let bestIdx = -1;
            let bestCost = Infinity;

            for (let i = 0; i < numTechnicians; i++) {
                if (i === nearestIdx) continue;
                const travel = this.travelTimeMinutes(
                    techLocations[i],
                    box.location,
                    speedKmh
                );
                const cost =
                    assignments[i].totalTimeMinutes + travel + box.fixTimeMinutes;
                if (cost <= deadlineMinutes && cost < bestCost) {
                    bestCost = cost;
                    bestIdx = i;
                }
            }

            if (bestIdx === -1) return null;

            assignments[bestIdx].assignedBoxIds.push(box.id);
            assignments[bestIdx].totalTimeMinutes = bestCost;
            techLocations[bestIdx] = box.location;
        }

        return assignments;
    }

    findMinimumTeamSize(
        startLocation: Location,
        speedKmh: number,
        boxes: Box[],
        deadlineMinutes: number
    ): TeamSizeResult {
        if (boxes.length === 0) {
            return {
                techniciansNeeded: 0,
                assignments: [],
                feasible: true,
            };
        }

        for (const box of boxes) {
            const solo =
                this.travelTimeMinutes(startLocation, box.location, speedKmh) +
                box.fixTimeMinutes;
            if (solo > deadlineMinutes) {
                return {
                    techniciansNeeded: boxes.length,
                    assignments: [],
                    feasible: false,
                };
            }
        }

        for (let n = 1; n <= boxes.length; n++) {
            const result = this.tryAssign(
                startLocation,
                speedKmh,
                boxes,
                n,
                deadlineMinutes
            );
            if (result) {
                return {
                    techniciansNeeded: n,
                    assignments: result,
                    feasible: true,
                };
            }
        }

        return {
            techniciansNeeded: boxes.length,
            assignments: [],
            feasible: false,
        };
    }
}
