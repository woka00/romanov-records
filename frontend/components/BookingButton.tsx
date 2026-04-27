"use client";
import { useState } from "react";
import BookingModal from "./BookingModal";

export default function BookingButton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className={className ?? "btn-book text-white hover:bg-white hover:text-studio-dark"}
        style={style}
        onClick={() => setOpen(true)}
      >
        записаться
      </button>
      <BookingModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
