import type { CSSProperties } from "react";
import type { PetMotion } from "@/data/lab";
import s from "./pet-sprite.module.css";

export function PetSprite({
  memberId,
  motion,
  scale = 1,
  label,
}: {
  memberId: string;
  motion: PetMotion;
  scale?: number;
  label?: string;
}) {
  return (
    <span
      className={s.sprite}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={
        {
          backgroundImage: `url(/images/lab/exo-mungchiz/${memberId}.webp)`,
          "--s": scale,
          "--row": motion.row,
          "--frames": motion.frames,
          "--ms": motion.frameMs,
        } as CSSProperties
      }
    />
  );
}
