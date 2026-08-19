"use client";

import { useState } from "react";
import { Input } from "./Field";
import { isHexColor } from "@/core/branding";

export function ColorField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const submitted = isHexColor(value) ? value.toUpperCase() : defaultValue;

  return (
    <div className="overflow-hidden rounded-2xl bg-canvas ring-1 ring-black/[0.06] dark:ring-white/10">
      <label className="relative block h-16 cursor-pointer overflow-hidden">
        <span className="absolute inset-0" style={{ background: submitted }} />
        <input
          type="color"
          value={submitted}
          onChange={(event) => setValue(event.target.value.toUpperCase())}
          className="absolute inset-0 h-[200%] w-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer opacity-0"
          aria-label={`${name} picker`}
        />
      </label>
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          if (isHexColor(value)) setValue(value.toUpperCase());
          else setValue(defaultValue);
        }}
        className="rounded-none bg-white font-mono dark:bg-white/10 dark:text-ink"
      />
      <input type="hidden" name={name} value={submitted} />
    </div>
  );
}
