"use client";

import { useEffect, useState } from "react";

/**
 * 数値入力欄。入力中はクランプせず自由に打たせ、blur時にだけ範囲内へ丸めて確定する。
 * (毎キー入力でmin値にクランプすると、入力欄をクリアして打ち直した瞬間に値が
 * 最小値へ引き戻されてしまい「直接入力できない」ように見えるバグを防ぐ)
 */
export function NumberInput({
  value,
  onCommit,
  min,
  max,
  step,
  disabled,
  className,
}: {
  value: number;
  onCommit: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  disabled?: boolean;
  className?: string;
}) {
  const [text, setText] = useState(String(value));

  // スライダー操作や業務切替など、他要因で value が変わったら表示も追従させる
  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <input
      type="number"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const n = Number(raw);
        if (raw !== "" && Number.isFinite(n)) onCommit(n);
      }}
      onBlur={() => {
        const n = Number(text);
        const clamped = Math.min(max, Math.max(min, Number.isFinite(n) ? n : min));
        onCommit(clamped);
        setText(String(clamped));
      }}
      className={className}
    />
  );
}
