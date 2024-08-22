"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeam, useUser } from "@/lib/store";
import { CheckIcon, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SelectTeam({ session }: { session: any }) {
  const user = useUser((state) => state.user);
  const setUser = useUser((state) => state.setUser);
  const activeTeam = useTeam((state) => state.team);
  const setActiveTeam = useTeam((state) => state.setTeam);

  useEffect(() => {
    if (session && user === null) {
      fetch(`/api/user/profile`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setUser(data.data);
          } else {
            toast.error(data.message);
          }
        })
        .catch((err) => console.log(err));
    }
  }, [session, user, setUser]);

  useEffect(() => {
    if (user && activeTeam === null) {
      setActiveTeam(user.teams.find((o: any) => o.team.id === user.currentTeamId).team);
    }
  }, [user, activeTeam, setActiveTeam]);

  // const router = useRouter();
  // const [selectedMerchant, setSelectedMerchant] = useState();
  // const [merchants, setMerchants] = useState([]);
  // const activeTeam = useTeam((state) => state.team);
  // const setActiveTeam = useTeam((state) => state.setTeam);

  // useEffect(() => {
  //   const getMerchants = async () => {
  //     const { data, error } = await supabase.from("merchants").select("*").eq("user_id", session?.user?.id);
  //     if (!error) {
  //       if (data.length > 0) {
  //         setMerchants(data);
  //         setSelectedMerchant(data[0]);
  //       } else {
  //         router.push("/connect");
  //       }
  //     }
  //   };

  //   getMerchants();
  // }, [supabase, session]);

  // useEffect(() => {
  //   if (selectedMerchant) {
  //     fetch(`/api/customers/sync?token=${selectedMerchant.access_token}&merchant_id=${selectedMerchant.id}`);
  //     setActiveMerchant(selectedMerchant);
  //   }
  // }, [selectedMerchant, setActiveMerchant]);

  // const handleSelectedMerchant = async (e) => {
  //   const selectedData = find(merchants, (o) => o.id === e);
  //   setSelectedMerchant(selectedData);
  //   await supabase
  //     .from("merchants")
  //     .update({
  //       is_active: false,
  //     })
  //     .eq("user_id", session.user.id)
  //     .select();

  //   await supabase
  //     .from("merchants")
  //     .update({
  //       is_active: true,
  //     })
  //     .eq("user_id", session.user.id)
  //     .eq("mid", selectedData.mid)
  //     .select();
  // };

  // if (!activeMerchant) {
  //   return null;
  // }

  return (
    <>
      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-white border border-white/20 w-full p-2.5 rounded-md flex items-center justify-between text-xs font-medium hover:border-white/50 hover:bg-white/10">
            <span>{activeTeam?.name}</span>
            <ChevronDown className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Teams</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user?.teams.map((t: any) => (
              <DropdownMenuItem onClick={() => setActiveTeam(t.team)} key={t.team.id}>
                {t.team.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* <Listbox value={selectedMerchant?.id} onChange={handleSelectedMerchant}>
        <div className="relative">
          <Listbox.Button className="relative w-full cursor-pointer h-16 bg-gray-700 text-white font-bold py-2 pl-4 pr-10 text-left shadow-sm focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
            <span className="block truncate">{selectedMerchant?.name}</span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
              <ChevronDown />
            </span>
          </Listbox.Button>
          <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              {merchants &&
                merchants.length > 0 &&
                merchants.map((i, idx) => (
                  <Listbox.Option
                    key={idx}
                    className={({ active }) =>
                      `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? "bg-pink-100 text-pink-900" : "text-gray-900"}`
                    }
                    value={i.id}
                  >
                    {({ selected }) => (
                      <>
                        <span className={`block truncate ${selected ? "font-medium" : "font-normal"}`}>{i.name}</span>
                        {selected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-pink-600">
                            <CheckIcon className="w-4 h-4" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox> */}
    </>
  );
}
