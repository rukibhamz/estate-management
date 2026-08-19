"use client";

import { useState } from "react";
import { Input } from "./Field";
import { isHexColor } from "@/core/branding";

export function ColorField({ name, defaultValue }: { name: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const submitted = isHexColor(value) ? value.toUpperCase() : defaultValue;

  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={submitted}
        onChange={(event) => setValue(event.target.value.toUpperCase())}
        className="h-11 w-14 cursor-pointer rounded-2xl border-0 bg-transparent"
        aria-label={`${name} picker`}
      />
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={() => {
          if (isHexColor(value)) setValue(value.toUpperCase());
          else setValue(defaultValue);
        }}
        className="font-mono"
      />
      <input type="hidden" name={name} value={submitted} />
    </div>
  );
}
