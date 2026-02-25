import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { BusRoute } from '../utils/busTimingsSyncUtils';
import { LaundrySettings } from '../utils/laundrySyncUtils';
import { WeekMenu } from '../utils/messSyncUtils';
import { StudentData } from '../utils/nameUtils';

interface DashboardCounts {
    complaints: number;
    visitors: number;
    roomServices: number;
    leaves: number;
    facilities: number;
}

interface DashboardState {
    studentData: StudentData | null;
    messMenu: WeekMenu;
    laundrySettings: LaundrySettings | null;
    busRoutes: BusRoute[];
    dashboardCounts: DashboardCounts;
    lastSynced: number | null;

    // Actions
    setStudentData: (data: StudentData | null) => void;
    setMessMenu: (menu: WeekMenu) => void;
    setLaundrySettings: (settings: LaundrySettings | null) => void;
    setBusRoutes: (routes: BusRoute[]) => void;
    setDashboardCounts: (counts: Partial<DashboardCounts>) => void;
    setLastSynced: (timestamp: number) => void;
    clearCache: () => void;
}

export const useDashboardStore = create<DashboardState>()(
    persist(
        (set) => ({
            studentData: null,
            messMenu: {},
            laundrySettings: null,
            busRoutes: [],
            dashboardCounts: {
                complaints: 0,
                visitors: 0,
                roomServices: 0,
                leaves: 0,
                facilities: 0,
            },
            lastSynced: null,

            setStudentData: (studentData) => set({ studentData }),
            setMessMenu: (messMenu) => set({ messMenu }),
            setLaundrySettings: (laundrySettings) => set({ laundrySettings }),
            setBusRoutes: (busRoutes) => set({ busRoutes }),
            setDashboardCounts: (counts) => set((state) => ({
                dashboardCounts: { ...state.dashboardCounts, ...counts }
            })),
            setLastSynced: (lastSynced) => set({ lastSynced }),
            clearCache: () => set({
                studentData: null,
                messMenu: {},
                laundrySettings: null,
                busRoutes: [],
                dashboardCounts: {
                    complaints: 0,
                    visitors: 0,
                    roomServices: 0,
                    leaves: 0,
                    facilities: 0,
                },
                lastSynced: null,
            }),
        }),
        {
            name: 'dashboard-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
