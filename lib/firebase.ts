import {isSupported, getAnalytics} from "firebase/analytics";
import {app} from "@/lib/firebaseCore";

export {app, db} from "@/lib/firebaseCore";

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) getAnalytics(app);
  });
}
