import {useEffect, useState} from "react";
import {getAuth, onAuthStateChanged, signInAnonymously, signOut} from "firebase/auth";
import {app} from "@/lib/firebase";

export const auth = getAuth(app);

export function useAdminAuth() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setAuthed(!!user);
      setReady(true);
    });
  }, []);

  async function unlock(pin: string): Promise<boolean> {
    if (pin !== process.env.NEXT_PUBLIC_ADMIN_PIN) return false;
    await signInAnonymously(auth);
    return true;
  }

  async function lock() {
    await signOut(auth);
  }

  return {ready, authed, unlock, lock};
}
