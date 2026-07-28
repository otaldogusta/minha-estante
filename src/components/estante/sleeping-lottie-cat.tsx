import React from "react";
import { SleepingShelfCat } from "./sleeping-shelf-cat";

interface SleepingLottieCatProps {
  useLottie?: boolean;
}

export function SleepingLottieCat({ useLottie = true }: SleepingLottieCatProps) {
  return <SleepingShelfCat />;
}
