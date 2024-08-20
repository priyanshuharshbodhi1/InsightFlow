"use client";

import { Fragment, useEffect, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronDown } from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { find } from "lodash";
import { useMerchant } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function SelectMerchant({ session }) {
  const router = useRouter();
  const [selectedMerchant, setSelectedMerchant] = useState();
  const [merchants, setMerchants] = useState([]);
  const supabase = createClientComponentClient();
  const activeMerchant = useMerchant((state) => state.merchant);
  const setActiveMerchant = useMerchant((state) => state.setMerchant);

  useEffect(() => {
    const getMerchants = async () => {
      const { data, error } = await supabase.from("merchants").select("*").eq("user_id", session?.user?.id);
      if (!error) {
        if (data.length > 0) {
          setMerchants(data);
          setSelectedMerchant(data[0]);
        } else {
          router.push("/connect");
        }
      }
    };

    getMerchants();
  }, [supabase, session]);

  useEffect(() => {
    if (selectedMerchant) {
      fetch(`/api/customers/sync?token=${selectedMerchant.access_token}&merchant_id=${selectedMerchant.id}`);
      setActiveMerchant(selectedMerchant);
    }
  }, [selectedMerchant, setActiveMerchant]);

  const handleSelectedMerchant = async (e) => {
    const selectedData = find(merchants, (o) => o.id === e);
    setSelectedMerchant(selectedData);
    await supabase
      .from("merchants")
      .update({
        is_active: false,
      })
      .eq("user_id", session.user.id)
      .select();

    await supabase
      .from("merchants")
      .update({
        is_active: true,
      })
      .eq("user_id", session.user.id)
      .eq("mid", selectedData.mid)
      .select();
  };

  if (!activeMerchant) {
    return null;
  }

  return (
    <>
      <Listbox value={selectedMerchant?.id} onChange={handleSelectedMerchant}>
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
      </Listbox>
    </>
  );
}
