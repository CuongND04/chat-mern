import { useEffect, useState } from "react";

const AuthImagePattern = ({ title, subtitle }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % 9);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleImageError = (index) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="relative hidden overflow-hidden rounded-[24px] border border-[color:var(--border-soft)] bg-[color:var(--surface-2)] p-7 lg:flex lg:min-h-[580px] lg:items-center lg:justify-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.06),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(148,163,184,0.10),transparent_28%)]" />
      <div className="soft-grid absolute inset-0 opacity-20" />

      <div className="relative z-10 max-w-md text-center">
        <div className="mb-7 grid grid-cols-3 gap-2.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, i) => (
            <div
              key={i}
              className={`relative aspect-square overflow-hidden rounded-[14px] border border-[color:var(--border-soft)] bg-white transition-all duration-500 ${
                activeIndex === i
                  ? "scale-[1.02] border-[color:var(--border-strong)]"
                  : "opacity-90"
              }`}
            >
              {!imageErrors[i] ? (
                <>
                  <img
                    src={`/statics/${num}.jpg`}
                    alt={`User ${num}`}
                    className={`h-full w-full object-cover transition-all duration-500 ${
                      activeIndex === i ? "brightness-110" : "brightness-95"
                    }`}
                    onError={() => handleImageError(i)}
                  />
                  {activeIndex === i && (
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(255,255,255,0.24))]" />
                  )}
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[color:var(--surface-2)]">
                  <span className="text-xl font-semibold text-[color:var(--text-muted)]">{num}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="rounded-[20px] border border-[color:var(--border-soft)] bg-white/88 px-5 py-6">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[color:var(--text-faint)]">
            Swiss product UI
          </p>
          <h2 className="text-[22px] font-semibold leading-8 text-[color:var(--text-strong)]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] leading-6 text-[color:var(--text-muted)]">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

export default AuthImagePattern;
