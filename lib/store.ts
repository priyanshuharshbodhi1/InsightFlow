import { create } from "zustand";

interface LoadingState {
  msg: string;
  setMsg: (msg: string) => void;
}

interface TeamState {
  team: string;
  setTeam: (team: string) => void;
}

export const useLoading = create<LoadingState>()((set) => ({
  msg: "",
  setMsg: (msg) => set(() => ({ msg: msg })),
}));

export const useTeam = create<TeamState>()((set) => ({
  team: "",
  setTeam: (team) => set(() => ({ team: team })),
}));
